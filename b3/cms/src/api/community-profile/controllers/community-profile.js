'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { getAddress, isAddress } = require('viem');
const nacl = require('tweetnacl');
const bs58 = require('bs58');
const { PublicKey } = require('@solana/web3.js');
const { SiweMessage } = require('siwe');

const { createCoreController } = require('@strapi/strapi').factories;

const NONCE_TTL_MS = 10 * 60 * 1000;

function normalizeEvmAddress(addr) {
  if (!addr || typeof addr !== 'string') return null;
  const t = addr.trim();
  if (!isAddress(t)) return null;
  return getAddress(t).toLowerCase();
}

function maskAddress(addr) {
  if (!addr || typeof addr !== 'string' || addr.length < 10) return null;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function getJwtSecret(strapi) {
  return (
    process.env.COMMUNITY_PROFILE_JWT_SECRET ||
    process.env.JWT_SECRET ||
    strapi.config.get('plugin.users-permissions.jwtSecret') ||
    strapi.config.get('admin.auth.secret') ||
    'dev-only-change-me'
  );
}

function issueWalletJwt(strapi, address) {
  const secret = getJwtSecret(strapi);
  return jwt.sign(
    { sub: address.toLowerCase(), typ: 'wallet' },
    secret,
    { expiresIn: '24h', issuer: 'buildchain-community-profile' }
  );
}

function verifyWalletJwt(strapi, token) {
  try {
    const secret = getJwtSecret(strapi);
    const p = jwt.verify(token, secret, {
      issuer: 'buildchain-community-profile',
    });
    if (p.typ !== 'wallet' || typeof p.sub !== 'string') return null;
    return p.sub.toLowerCase();
  } catch {
    return null;
  }
}

function getBearer(ctx) {
  const h = ctx.request.header.authorization;
  if (!h || !h.startsWith('Bearer ')) return null;
  return h.slice(7).trim();
}

function sanitizeProfileEntry(entry) {
  if (!entry || typeof entry !== 'object') return entry;
  const out = { ...entry };
  if (out.ownerAddress) {
    delete out.ownerAddress;
    out.ownerMasked = maskAddress(entry.ownerAddress);
  }
  return out;
}

function verifySolana(address, message, signatureBase58) {
  try {
    const pubkey = new PublicKey(address);
    const sig = bs58.decode(signatureBase58);
    const msg =
      typeof message === 'string'
        ? new TextEncoder().encode(message)
        : Buffer.from(message);
    return nacl.sign.detached.verify(msg, sig, pubkey.toBytes());
  } catch {
    return false;
  }
}

module.exports = createCoreController('api::community-profile.community-profile', ({ strapi }) => ({
  async find(ctx) {
    const res = await super.find(ctx);
    if (res?.data && Array.isArray(res.data)) {
      res.data = res.data.map((row) => sanitizeProfileEntry(row));
    }
    return res;
  },

  async findOne(ctx) {
    const res = await super.findOne(ctx);
    if (res?.data) {
      res.data = sanitizeProfileEntry(res.data);
    }
    return res;
  },

  async walletNonce(ctx) {
    const knex = strapi.db.connection;
    const body = ctx.request.body || {};
    const addr = normalizeEvmAddress(body.address);
    if (!addr) {
      return ctx.badRequest('Invalid EVM address');
    }
    const nonce = crypto.randomBytes(16).toString('hex');
    await knex('community_wallet_nonces').where({ address: addr }).delete();
    await knex('community_wallet_nonces').insert({
      nonce,
      address: addr,
      expires_at: Date.now() + NONCE_TTL_MS,
    });
    ctx.body = {
      data: {
        nonce,
        statement: 'Sign in with Ethereum to BUILDCHAIN Community Profile.',
      },
    };
  },

  async walletVerify(ctx) {
    const knex = strapi.db.connection;
    const body = ctx.request.body || {};
    const message = body.message;
    const signature = body.signature;
    if (!message || typeof message !== 'string' || !signature || typeof signature !== 'string') {
      return ctx.badRequest('SIWE message and signature required');
    }

    let siwe;
    try {
      siwe =
        typeof SiweMessage.fromMessage === 'function'
          ? SiweMessage.fromMessage(message)
          : new SiweMessage(message);
    } catch {
      return ctx.badRequest('Invalid SIWE message');
    }

    let siweOk;
    try {
      siweOk = await siwe.verify({ signature });
    } catch (e) {
      strapi.log.warn('SIWE verify failed', e);
      return ctx.badRequest('SIWE verification failed');
    }

    if (!siweOk.success) {
      return ctx.badRequest('Invalid signature');
    }

    const address = normalizeEvmAddress(siwe.address);
    if (!address) {
      return ctx.badRequest('Invalid address in SIWE message');
    }

    const chainId = Number(siwe.chainId);
    const allowedChains = (process.env.WALLET_AUTH_CHAIN_IDS || '8453')
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n));
    if (allowedChains.length && !allowedChains.includes(chainId)) {
      return ctx.badRequest('Unsupported chain for wallet auth');
    }

    const allowedDomains = (process.env.SIWE_ALLOWED_DOMAINS || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const domain = (siwe.domain || '').toLowerCase();
    if (allowedDomains.length && !allowedDomains.includes(domain)) {
      return ctx.badRequest('SIWE domain not allowed');
    }

    const row = await knex('community_wallet_nonces').where({ nonce: siwe.nonce }).first();
    if (!row || Number(row.expires_at) < Date.now()) {
      return ctx.badRequest('Nonce expired — request a new one');
    }
    if (String(row.address).toLowerCase() !== address) {
      return ctx.badRequest('Wallet address does not match nonce');
    }

    await knex('community_wallet_nonces').where({ nonce: siwe.nonce }).delete();

    const token = issueWalletJwt(strapi, address);
    ctx.body = { data: { jwt: token, address } };
  },

  async me(ctx) {
    const token = getBearer(ctx);
    const wallet = token && verifyWalletJwt(strapi, token);
    if (!wallet) {
      return ctx.unauthorized('Wallet JWT required');
    }
    const entry = await strapi.db.query('api::community-profile.community-profile').findOne({
      where: { ownerAddress: wallet },
      populate: {
        avatar: true,
        cover: true,
        gallery: true,
        socialLinks: true,
        walletLinks: true,
      },
    });
    if (!entry) {
      ctx.body = { data: null };
      return;
    }
    ctx.body = {
      data: {
        ...entry,
        ownerAddress: entry.ownerAddress,
      },
    };
  },

  async createMine(ctx) {
    const token = getBearer(ctx);
    const wallet = token && verifyWalletJwt(strapi, token);
    if (!wallet) {
      return ctx.unauthorized('Wallet JWT required');
    }
    const existing = await strapi.db.query('api::community-profile.community-profile').findOne({
      where: { ownerAddress: wallet },
    });
    if (existing) {
      return ctx.badRequest('Profile already exists — use save instead');
    }
    const body = ctx.request.body?.data || ctx.request.body || {};
    const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : '';
    const slugRaw = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : '';
    if (!displayName || displayName.length < 2) {
      return ctx.badRequest('displayName required');
    }
    if (!slugRaw || !/^[a-z0-9][a-z0-9-]{1,38}$/.test(slugRaw)) {
      return ctx.badRequest(
        'slug required (lowercase letters, numbers, hyphens; 2–40 chars)'
      );
    }
    const slugTaken = await strapi.db.query('api::community-profile.community-profile').findOne({
      where: { slug: slugRaw },
    });
    if (slugTaken) {
      return ctx.badRequest('Handle already taken');
    }
    const headline =
      typeof body.headline === 'string' ? body.headline.slice(0, 160) : '';
    const bio = typeof body.bio === 'string' ? body.bio : '';
    const focusTags = typeof body.focusTags === 'string' ? body.focusTags.slice(0, 2000) : '';
    let visibility = body.visibility;
    if (visibility && typeof visibility !== 'object') visibility = undefined;

    const created = await strapi.documents('api::community-profile.community-profile').create({
      data: {
        slug: slugRaw,
        displayName,
        headline,
        bio,
        focusTags,
        ownerAddress: wallet,
        visibility: visibility || {
          showWallets: true,
          showActivity: true,
          showSocialLinks: true,
        },
        socialLinks: Array.isArray(body.socialLinks) ? body.socialLinks : [],
        contactEnabled: !!body.contactEnabled,
        contactPriceEth:
          typeof body.contactPriceEth === 'string' ? body.contactPriceEth.slice(0, 32) : '',
        contactDestinationUrl:
          typeof body.contactDestinationUrl === 'string' ? body.contactDestinationUrl : '',
        contactIntro: typeof body.contactIntro === 'string' ? body.contactIntro.slice(0, 2000) : '',
        walletLinks: [
          {
            chain: 'evm',
            address: wallet,
            label: 'Primary',
            verifiedAt: new Date().toISOString(),
          },
        ],
      },
      populate: ['avatar', 'cover', 'gallery', 'socialLinks', 'walletLinks'],
    });

    ctx.body = { data: created };
  },

  async saveMine(ctx) {
    const token = getBearer(ctx);
    const wallet = token && verifyWalletJwt(strapi, token);
    if (!wallet) {
      return ctx.unauthorized('Wallet JWT required');
    }
    const existing = await strapi.db.query('api::community-profile.community-profile').findOne({
      where: { ownerAddress: wallet },
    });
    if (!existing) {
      return ctx.notFound('No profile for this wallet');
    }
    const body = ctx.request.body?.data || ctx.request.body || {};
    const patch = {};
    if (typeof body.displayName === 'string' && body.displayName.trim().length >= 2) {
      patch.displayName = body.displayName.trim().slice(0, 80);
    }
    if (typeof body.headline === 'string') patch.headline = body.headline.slice(0, 160);
    if (typeof body.bio === 'string') patch.bio = body.bio;
    if (typeof body.focusTags === 'string') patch.focusTags = body.focusTags.slice(0, 2000);
    if (body.visibility && typeof body.visibility === 'object') patch.visibility = body.visibility;
    if (Array.isArray(body.socialLinks)) patch.socialLinks = body.socialLinks;
    if (typeof body.contactEnabled === 'boolean') patch.contactEnabled = body.contactEnabled;
    if (typeof body.contactPriceEth === 'string') patch.contactPriceEth = body.contactPriceEth.slice(0, 32);
    if (typeof body.contactDestinationUrl === 'string')
      patch.contactDestinationUrl = body.contactDestinationUrl;
    if (typeof body.contactIntro === 'string') patch.contactIntro = body.contactIntro.slice(0, 2000);
    if (typeof body.slug === 'string') {
      const slugRaw = body.slug.trim().toLowerCase();
      if (slugRaw && /^[a-z0-9][a-z0-9-]{1,38}$/.test(slugRaw) && slugRaw !== existing.slug) {
        const taken = await strapi.db.query('api::community-profile.community-profile').findOne({
          where: { slug: slugRaw },
        });
        if (taken && taken.id !== existing.id) {
          return ctx.badRequest('Handle already taken');
        }
        patch.slug = slugRaw;
      }
    }

    const docId = existing.documentId || existing.id;
    const updated = await strapi.documents('api::community-profile.community-profile').update({
      documentId: docId,
      data: patch,
      populate: ['avatar', 'cover', 'gallery', 'socialLinks', 'walletLinks'],
    });

    ctx.body = {
      data: {
        ...updated,
        ownerAddress: updated.ownerAddress || wallet,
      },
    };
  },

  async linkWallet(ctx) {
    const token = getBearer(ctx);
    const wallet = token && verifyWalletJwt(strapi, token);
    if (!wallet) {
      return ctx.unauthorized('Wallet JWT required');
    }
    const body = ctx.request.body?.data || ctx.request.body || {};
    const chain = body.chain;
    const addressRaw = typeof body.address === 'string' ? body.address.trim() : '';
    const label = typeof body.label === 'string' ? body.label.slice(0, 80) : '';

    const profile = await strapi.db.query('api::community-profile.community-profile').findOne({
      where: { ownerAddress: wallet },
      populate: ['walletLinks'],
    });
    if (!profile) {
      return ctx.notFound('Create a profile first');
    }

    const links = Array.isArray(profile.walletLinks) ? [...profile.walletLinks] : [];

    const dedupeKey = `${chain}:${addressRaw}`;
    if (links.some((l) => `${l.chain}:${l.address}` === dedupeKey)) {
      return ctx.badRequest('Wallet already linked');
    }

    if (chain === 'bitcoin') {
      if (!addressRaw || addressRaw.length < 8) {
        return ctx.badRequest('Bitcoin address required');
      }
      links.push({
        chain: 'bitcoin',
        address: addressRaw,
        label: label || 'Bitcoin',
        verifiedAt: null,
      });
    } else if (chain === 'solana') {
      const message = body.message;
      const signature = body.signature;
      if (!addressRaw || !message || !signature) {
        return ctx.badRequest('address, message, and signature required');
      }
      const ok = verifySolana(addressRaw, message, signature);
      if (!ok) {
        return ctx.badRequest('Invalid Solana signature');
      }
      links.push({
        chain: 'solana',
        address: addressRaw,
        label: label || 'Solana',
        verifiedAt: new Date().toISOString(),
      });
    } else if (chain === 'sui') {
      const message = body.message;
      const signature = body.signature;
      if (!addressRaw || !signature) {
        return ctx.badRequest('address and signature required');
      }
      try {
        const { verifyPersonalMessageSignature } = await import('@mysten/sui/verify');
        const msgBytes =
          typeof message === 'string'
            ? new TextEncoder().encode(message)
            : Uint8Array.from(Buffer.from(message, 'base64'));
        await verifyPersonalMessageSignature(msgBytes, signature, {
          address: addressRaw,
        });
      } catch (e) {
        strapi.log.warn('Sui verify failed', e);
        return ctx.badRequest('Invalid Sui signature');
      }
      links.push({
        chain: 'sui',
        address: addressRaw,
        label: label || 'Sui',
        verifiedAt: new Date().toISOString(),
      });
    } else {
      return ctx.badRequest('Unsupported chain');
    }

    const docId = profile.documentId || profile.id;
    const updated = await strapi.documents('api::community-profile.community-profile').update({
      documentId: docId,
      data: { walletLinks: links },
      populate: ['walletLinks'],
    });

    ctx.body = {
      data: {
        ...updated,
        ownerAddress: wallet,
      },
    };
  },
}));
