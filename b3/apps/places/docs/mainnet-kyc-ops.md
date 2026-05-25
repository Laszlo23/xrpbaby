# Mainnet compliance ops

## Disable KYC bypass (required before retail)

`ComplianceRegistry.kycBypass` MUST be `false` on Base mainnet production.

```bash
# Via multisig — ComplianceRegistry at 0xa655c0B0037699433F0692356a3A142956103B7a (see base-mainnet.json)
cast send 0xa655c0B0037699433F0692356a3A142956103B7a \
  "setKycBypass(bool)" false \
  --rpc-url $BASE_RPC_URL \
  --account deployer
```

Verify:

```bash
cast call 0xa655c0B0037699433F0692356a3A142956103B7a "kycBypass()(bool)" --rpc-url $BASE_RPC_URL
```

## KYC webhook env (Places web)

| Variable | Purpose |
|----------|---------|
| `VERIFF_SHARED_SECRET` | Webhook HMAC verification |
| `RELAYER_PRIVATE_KEY` | Relay `setWalletStatus(Verified)` |
| `COMPLIANCE_REGISTRY_ADDRESS` | Base registry |
| `CHAINLINK_ACE_CCID_ENDPOINT` | Optional CCID sync |
| `CHAINLINK_ACE_API_KEY` | Optional ACE Platform |

## Pre-flight

- [ ] `kycBypass == false`
- [ ] KYC webhook returns 200 on test payload (not 503)
- [ ] Relayer funded with ETH on Base
- [ ] Matrix updated in `docs/CHAINLINK_RWA_COMPLIANCE.md`
