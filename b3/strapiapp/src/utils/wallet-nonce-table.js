'use strict';

/** Durable SIWE nonce rows — replaces in-memory `Map` (survives restarts / multi-instance). */
async function ensureWalletNonceTable(strapi) {
  const knex = strapi.db.connection;
  const has = await knex.schema.hasTable('community_wallet_nonces');
  if (has) return;
  await knex.schema.createTable('community_wallet_nonces', (t) => {
    t.string('nonce', 64).primary();
    t.string('address', 42).notNullable().index();
    t.bigInteger('expires_at').notNullable();
  });
}

module.exports = { ensureWalletNonceTable };
