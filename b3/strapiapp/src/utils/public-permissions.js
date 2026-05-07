'use strict';

/**
 * Remove legacy template CMS reads from the Public role.
 * Docs / marketing that still need `article` should use a server-to-server token, not anonymous find.
 */
async function narrowPublicCmsPermissions(strapi) {
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });
  if (!publicRole) return;

  const knex = strapi.db.connection;
  const prefixes = [
    'api::article.article.',
    'api::category.category.',
    'api::author.author.',
    'api::global.global.',
    'api::about.about.',
  ];

  for (const prefix of prefixes) {
    const rows = await knex('up_permissions')
      .join('up_permissions_role_lnk', 'up_permissions.id', 'up_permissions_role_lnk.permission_id')
      .where('up_permissions_role_lnk.role_id', publicRole.id)
      .where('up_permissions.action', 'like', `${prefix}%`)
      .select('up_permissions.id');
    const ids = rows.map((r) => r.id);
    if (ids.length > 0) {
      await knex('up_permissions').whereIn('id', ids).del();
    }
  }
}

module.exports = { narrowPublicCmsPermissions };
