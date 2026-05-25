'use strict';

/**
 * Create a read-only API token for local dev if STRAPI_API_TOKEN is not set in cms/.env.
 * Prints the token once — add to app/.env as STRAPI_API_TOKEN.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TOKEN_NAME = 'local-dev-read';
const ENV_PATH = path.join(__dirname, '..', '.env');

function readEnvToken() {
  if (!fs.existsSync(ENV_PATH)) return '';
  const text = fs.readFileSync(ENV_PATH, 'utf8');
  const m = text.match(/^STRAPI_API_TOKEN=(.+)$/m);
  return m?.[1]?.trim() ?? '';
}

async function main() {
  const existing = readEnvToken();
  if (existing && existing !== 'change-me') {
    console.log('[ensure-api-token] STRAPI_API_TOKEN already in cms/.env');
    console.log(existing);
    process.exit(0);
  }

  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'error';

  const tokenService = app.admin.services['api-token'];
  const existingTokens = await tokenService.list();
  const found = existingTokens?.find?.((t) => t.name === TOKEN_NAME);
  if (found) {
    console.log(
      '[ensure-api-token] Token exists in DB but secret is not recoverable. Create a new token in Admin or delete',
      TOKEN_NAME,
      'and re-run.',
    );
    await app.destroy();
    process.exit(1);
  }

  const created = await tokenService.create({
    name: TOKEN_NAME,
    description: 'Local dev read token (auto-generated)',
    type: 'read-only',
    lifespan: null,
  });

  const tokenValue = created?.accessKey;

  if (!tokenValue) {
    console.error('[ensure-api-token] Could not read token from create response — use Admin UI');
    await app.destroy();
    process.exit(1);
  }

  let envText = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : '';
  if (/^STRAPI_API_TOKEN=/m.test(envText)) {
    envText = envText.replace(/^STRAPI_API_TOKEN=.*$/m, `STRAPI_API_TOKEN=${tokenValue}`);
  } else {
    envText += `\nSTRAPI_API_TOKEN=${tokenValue}\n`;
  }
  fs.writeFileSync(ENV_PATH, envText);

  console.log('[ensure-api-token] Created read-only token and wrote cms/.env STRAPI_API_TOKEN');
  console.log(tokenValue);

  await app.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
