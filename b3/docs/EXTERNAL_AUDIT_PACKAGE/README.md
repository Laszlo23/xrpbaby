# External audit package

Handoff materials for third-party smart contract auditors. See also [`CONTRACTS_AUDIT.md`](../CONTRACTS_AUDIT.md) for deployment addresses.

## Contents

| Document | Purpose |
|----------|---------|
| [SCOPE.md](./SCOPE.md) | In-scope contracts and out-of-scope boundaries |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Treasury Safe, hot wallet, bridge relayer |
| [../BCC_BRIDGE_SECURITY.md](../BCC_BRIDGE_SECURITY.md) | Bridge threat model |
| [../TREASURY_POLICY.md](../TREASURY_POLICY.md) | Agent wallet caps |
| [../CONTRACT_AUDIT_FINDINGS.md](../CONTRACT_AUDIT_FINDINGS.md) | Slither + remediation tracker |

## Test evidence

```bash
bash scripts/forge-test-all.sh
npm run slither   # optional static analysis
```

## Pre-audit checklist

- [ ] All Foundry tests green
- [ ] Slither high findings = 0 (or documented exceptions)
- [ ] Deploy addresses match `docs/CONTRACTS_AUDIT.md`
- [ ] External report published → check off `deploy/VERIFY_GATE.md` item 28

## Contact

Operator: see `docs/GRANT_READINESS_PACK.md`
