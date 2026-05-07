# `@bc/identity` in Strapi

`@bc/identity` ships **ESM + CJS** builds via `tsup`. Strapi 5 resolves `require('@bc/identity/server')` to the CommonJS bundle under `dist/server/index.cjs`.

If the admin or server bundler ever rejects the dual package, fall back to a tiny CJS shim that uses dynamic `import()` to load the ESM build (see plan “Strapi packaging” note).
