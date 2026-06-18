// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";

/// @notice Phase 2 LayerZero OFT migration checklist script (operator-run, no auto-migrate).
/// @dev Requires @layerzerolabs/oft-evm — install before broadcast:
///      forge install LayerZero-Labs/oft-evm --no-commit
///
/// Steps (manual):
/// 1. Pause custom relayer + vault/wBCC contracts
/// 2. Snapshot vault.lockedBalance() and wBCC.totalSupply()
/// 3. Deploy OFT Adapter on Base + OFT wBCC on BSC with sharedDecimals
/// 4. Wire LZ peers (Base EID 30184, BSC EID 30102)
/// 5. Migrate liquidity from deprecated BccOFT (0x81cC…) to new wBCC OFT
/// 6. Set VITE_BRIDGE_MODE=layerzero in app env
/// 7. Unpause after smoke test
contract MigrateBccLayerZero is Script {
    uint32 constant LZ_EID_BASE = 30_184;
    uint32 constant LZ_EID_BSC = 30_102;

    function run() external view {
        address legacyVault = vm.envOr("LEGACY_BCC_BRIDGE_VAULT", address(0));
        address legacyWbcc = vm.envOr("LEGACY_WBCC_ADDRESS", address(0));
        address legacyOftAdapter = vm.envOr("LEGACY_OFT_ADAPTER", address(0xd323e5b266FA7A13C9c572ad5c7b7f996846EFc0));
        address legacyBscOft = vm.envOr("LEGACY_BSC_OFT", address(0x81cCda83704985FcB88e1174Da4367eEa40871C4));

        console2.log("=== BCC LayerZero migration checklist ===");
        console2.log("Legacy vault:", legacyVault);
        console2.log("Legacy wBCC:", legacyWbcc);
        console2.log("Legacy OFT adapter (Base):", legacyOftAdapter);
        console2.log("Legacy BSC OFT:", legacyBscOft);
        console2.log("Base EID:", LZ_EID_BASE);
        console2.log("BSC EID:", LZ_EID_BSC);
        console2.log("");
        console2.log("Deploy new contracts with DeployBccOFT.s.sol after adding oft-evm dependency.");
        console2.log("Update contracts/deployments/bcc-56.json and app VITE_BRIDGE_MODE=layerzero.");
    }
}
