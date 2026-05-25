'use strict';

/**
 * Import roadmap items from data/data.json when the collection is empty.
 * Safe to run while Strapi is stopped (spins up its own instance).
 */
const { roadmapItems } = require('../data/data.json');

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'error';

  const existing = await app.documents('api::roadmap-item.roadmap-item').findMany({
    status: 'published',
    limit: 1,
  });
  if (existing?.length) {
    console.log('[ensure-roadmap-seed] roadmap items already present — skip');
    await app.destroy();
    process.exit(0);
  }

  if (!roadmapItems?.length) {
    console.warn('[ensure-roadmap-seed] no roadmapItems in data.json');
    await app.destroy();
    process.exit(1);
  }

  for (const item of roadmapItems) {
    await app.documents('api::roadmap-item.roadmap-item').create({
      data: item,
      status: 'published',
    });
    console.log('[ensure-roadmap-seed] created', item.slug);
  }

  await app.destroy();
  console.log('[ensure-roadmap-seed] done');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
