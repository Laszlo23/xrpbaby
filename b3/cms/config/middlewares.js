module.exports = ({ env }) => {
  const nodeEnv = env('NODE_ENV', 'development');
  const raw = env(
    'CORS_ORIGIN',
    'http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173'
  );
  const corsOrigins = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (nodeEnv === 'production' && corsOrigins.length === 0) {
    throw new Error(
      'CORS_ORIGIN must list at least one origin in production (wildcard with credentials is disabled).'
    );
  }

  return [
    'strapi::logger',
    'strapi::errors',
    'strapi::security',
    {
      resolve: './src/middlewares/wallet-rate-limit',
      config: { max: 40, windowMs: 60_000 },
    },
    {
      name: 'strapi::cors',
      config: {
        origin: corsOrigins.length ? corsOrigins : false,
        credentials: true,
      },
    },
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};
