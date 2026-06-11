# Privy dashboard — mobile checklist

Complete these in [Privy dashboard](https://dashboard.privy.io) before App Store / Play Store submission.

App ID: `cmo4s85vq00z80cl47cz0qm2j` (same as web).

## Allowed origins

```
https://app.buildingcultureid.space
capacitor://localhost
https://localhost
```

## Redirect URLs (deep-link auth)

```
buildingculture://auth/callback
```

## Login methods (already on web)

- Email, Google, Apple, Farcaster, wallet — confirm Apple + Google enabled for production.

## WalletConnect

Project ID: `VITE_WALLETCONNECT_PROJECT_ID` in `app/.env`.

On device, verify MetaMask / Rainbow can return to the Capacitor WebView after connect.

## Physical device smoke test

- [ ] Email OTP login
- [ ] Google OAuth
- [ ] Apple Sign In (iOS)
- [ ] External wallet connect
- [ ] Embedded smart wallet created on Base

See [docs/MOBILE_APP.md](../../docs/MOBILE_APP.md) for full mobile docs.
