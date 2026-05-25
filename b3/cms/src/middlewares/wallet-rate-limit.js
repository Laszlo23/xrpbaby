'use strict';

/** Simple fixed-window limiter per client IP for wallet auth routes. */
const buckets = new Map();

function clientKey(ctx) {
  const xf = ctx.request.header['x-forwarded-for'];
  if (typeof xf === 'string' && xf.length) {
    return xf.split(',')[0].trim();
  }
  return ctx.request.ip || ctx.ip || 'unknown';
}

module.exports = (config, { strapi }) => {
  const windowMs = config.windowMs ?? 60_000;
  const max = config.max ?? 40;

  return async (ctx, next) => {
    const path = ctx.path || '';
    if (!path.includes('/community-profiles/wallet/')) {
      return next();
    }

    const k = clientKey(ctx);
    const now = Date.now();
    let b = buckets.get(k);
    if (!b || b.reset < now) {
      b = { count: 0, reset: now + windowMs };
      buckets.set(k, b);
    }
    b.count += 1;
    if (b.count > max) {
      strapi.log.warn(`[wallet-rate-limit] 429 for ${k} on ${path}`);
      ctx.status = 429;
      ctx.set('Retry-After', String(Math.ceil(windowMs / 1000)));
      ctx.body = { error: { message: 'Too many wallet auth requests — try again shortly.' } };
      return;
    }

    await next();
  };
};
