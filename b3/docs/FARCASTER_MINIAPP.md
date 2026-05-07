# Farcaster Mini App — rollout checklist

## Submission

1. Complete [Farcaster Mini Apps](https://miniapps.farcaster.xyz) developer requirements (icons, manifest, privacy links).
2. Use `npm run farcaster:manifest` in `frontend` where configured; host manifest at a stable URL.
3. Wire **Neynar** (already in dependencies) for verified FID checks when gating weekly AGS rounds.

## Product gate (planned)

- Restrict **economy-sensitive** drops to `Neynar`-verified users.
- Keep read-only pages public.

## Legal

- Align copy with counsel before tying social graph to token distribution.

*Submission and store review are operator steps.*
