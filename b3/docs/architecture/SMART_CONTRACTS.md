# BCID Smart Contracts

Solidity contracts for BCID v1. Source: [`contracts/src/bcid/`](../../contracts/src/bcid/)

Deploy: **Base Sepolia (84532)** Month 2 testnet → **Base (8453)** Month 3 mainnet.

---

## Contract inventory

| Contract | File | Purpose |
|----------|------|---------|
| `BcidRegistry` | `BcidRegistry.sol` | Soulbound Human BCID mint |
| `BcidSoulboundCredential` | `BcidSoulboundCredential.sol` | Non-transferable credential NFTs |
| `BcidRecoveryModule` | `BcidRecoveryModule.sol` | Guardian timelock recovery |
| `BcidProofVerifier` | `BcidProofVerifier.sol` | ZK proof verification (Month 6 stub) |

---

## BcidRegistry

### Interface

```solidity
function mint(string calldata handle) external payable returns (uint256 tokenId);
function ownerOf(uint256 tokenId) external view returns (address);
function getDid(uint256 tokenId) external view returns (string memory);
function handleToTokenId(string calldata handle) external view returns (uint256);
function isSoulbound() external pure returns (bool); // always true
```

### Rules
- Soulbound: `_update` override blocks transfers (pattern from `PropertyShareProof.sol`)
- Handle: 3–32 chars, `[a-z0-9-]`
- Mint price: configurable, matches ~$1.11 USD via oracle (reuse `IBccUsdOracle`)
- `mintWithBcc(handle)` optional BCC payment rail
- DID stored in tokenURI JSON: `did:bcid:human:{tokenId}`

### Events

```solidity
event BcidMinted(address indexed owner, uint256 indexed tokenId, string handle, string did);
```

---

## BcidSoulboundCredential

### Interface

```solidity
function issue(address to, bytes32 schemaId, bytes32 evidenceHash) external returns (uint256);
function revoke(uint256 tokenId) external;
function credentialSchema(uint256 tokenId) external view returns (bytes32);
```

### Roles
- `ISSUER_ROLE` — Building Culture issuer + approved EAS bridges
- `DEFAULT_ADMIN_ROLE` — Safe multisig (`0xCe03F6E734cC48393Ce41b257E998c68b521EB5c`)

### Schema IDs

| Schema | bytes32 label |
|--------|---------------|
| bcid-builder | `keccak256("bcid-builder")` |
| bcid-verified-human | `keccak256("bcid-verified-human")` |
| bcid-trusted-agent | `keccak256("bcid-trusted-agent")` |

---

## BcidRecoveryModule

### Interface

```solidity
function setGuardians(address[3] calldata guardians) external;
function initiateRecovery(uint256 bcidTokenId, address newOwner) external payable;
function approveRecovery(uint256 bcidTokenId) external;
function executeRecovery(uint256 bcidTokenId) external;
```

### Parameters
- Guardians: exactly 3 addresses
- Approvals required: 2-of-3
- Timelock: 72 hours after 2nd approval
- Fee: 0.01 ETH on initiate (burned via `payable` with no recipient)

---

## BcidProofVerifier (Month 6)

Stub in Month 2; full circuits Month 6.

```solidity
function verifyAge(bytes32 nullifier, uint8 minAge, bytes calldata proof) external returns (bool);
function verifyHuman(bytes32 nullifier, bytes calldata proof) external returns (bool);
function verifyOwnership(bytes32 commitment, bytes calldata proof) external returns (bool);
```

---

## EAS integration (optional Month 2)

| BCID action | EAS schema |
|-------------|------------|
| High-trust credential | Onchain attestation UID stored in `BcidCredential.easAttestationUid` |
| Low-trust credential | Postgres only |

EAS contract on Base: use canonical deployment per [EAS docs](https://docs.attest.org).

---

## Deployment script

```bash
cd contracts
forge script script/DeployBcid.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC \
  --broadcast --chain-id 84532
```

Env:
- `BCID_MINT_PRICE_WEI`
- `BCC_TOKEN_ADDRESS` (optional BCC rail)
- `BCC_ORACLE_ADDRESS`

Registry addresses documented in `docs/ADDRESSES.md` after deploy.

---

## Audit scope

Include in next audit batch:
- Soulbound transfer blocking
- Recovery timelock bypass attempts
- Reentrancy on mint/pay
- Guardian griefing (initiate spam → fee mitigates)

See [../security/THREAT_MODEL.md](../security/THREAT_MODEL.md).
