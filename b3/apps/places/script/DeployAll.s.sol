// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {ComplianceRegistry} from "../src/ComplianceRegistry.sol";
import {IComplianceRegistry} from "../src/interfaces/IComplianceRegistry.sol";
import {IPropertyShareFactoryMinimal} from "../src/interfaces/IPropertyShareFactoryMinimal.sol";
import {PropertyRegistry} from "../src/PropertyRegistry.sol";
import {PropertyShareProof} from "../src/PropertyShareProof.sol";
import {PurchaseEscrow} from "../src/PurchaseEscrow.sol";
import {PropertyShareFactory} from "../src/PropertyShareFactory.sol";
import {WETH9} from "../src/defi/WETH9.sol";
import {OgFactory} from "../src/defi/OgFactory.sol";
import {OgRouter} from "../src/defi/OgRouter.sol";
import {MockPriceOracle} from "../src/defi/MockPriceOracle.sol";
import {BinaryPredictionMarket} from "../src/defi/BinaryPredictionMarket.sol";
import {OgStaking} from "../src/staking/OgStaking.sol";

/// @notice Full stack deploy. Set PRIVATE_KEY and --rpc-url.
contract DeployAllScript is Script {
    function run() external {
        uint256 pk = vm.parseUint(vm.envString("PRIVATE_KEY"));
        address admin = vm.addr(pk);

        vm.startBroadcast(pk);
        PropertyRegistry registry = new PropertyRegistry(admin);
        PurchaseEscrow escrow = new PurchaseEscrow(address(registry));
        ComplianceRegistry compliance = new ComplianceRegistry(admin);
        PropertyShareFactory shareFactory =
            new PropertyShareFactory(address(registry), address(compliance), admin);
        WETH9 weth = new WETH9();
        OgFactory ogFactory = new OgFactory();
        OgRouter router = new OgRouter(address(ogFactory), address(weth));
        compliance.setSystemContract(address(router), true);
        /// @dev Set `KYC_BYPASS_ON_DEPLOY=1` or `true` so testnet swaps work without per-wallet verification.
        if (vm.envExists("KYC_BYPASS_ON_DEPLOY")) {
            string memory v = vm.envString("KYC_BYPASS_ON_DEPLOY");
            if (keccak256(bytes(v)) == keccak256(bytes("1")) || keccak256(bytes(v)) == keccak256(bytes("true"))) {
                compliance.setKycBypass(true);
            }
        }
        MockPriceOracle oracle = new MockPriceOracle(admin);
        BinaryPredictionMarket markets = new BinaryPredictionMarket(admin);
        string memory nftBase = "http://127.0.0.1:3000/api/nft/";
        if (vm.envExists("NFT_BASE_URI")) {
            nftBase = vm.envString("NFT_BASE_URI");
        }
        PropertyShareProof proofNft = new PropertyShareProof(
            admin,
            IComplianceRegistry(address(compliance)),
            IPropertyShareFactoryMinimal(address(shareFactory)),
            "Og Property Certificate",
            "OG-CERT",
            nftBase
        );
        uint256 cooldown = 3 days;
        if (vm.envExists("STAKING_COOLDOWN_SECONDS")) {
            cooldown = vm.envUint("STAKING_COOLDOWN_SECONDS");
        }
        OgStaking staking = new OgStaking(admin, cooldown);
        vm.stopBroadcast();

        console2.log("PropertyRegistry:", address(registry));
        console2.log("PurchaseEscrow:", address(escrow));
        console2.log("ComplianceRegistry:", address(compliance));
        console2.log("PropertyShareFactory:", address(shareFactory));
        console2.log("WETH9:", address(weth));
        console2.log("OgFactory:", address(ogFactory));
        console2.log("OgRouter:", address(router));
        console2.log("MockPriceOracle:", address(oracle));
        console2.log("BinaryPredictionMarket:", address(markets));
        console2.log("PropertyShareProof:", address(proofNft));
        console2.log("OgStaking:", address(staking));
        console2.log("--- Allowlist each OgPair via ComplianceRegistry.setSystemContract(pair, true) when pools are created ---");
        console2.log("--- Deploy SimpleLendingPool after collateral token exists; use DeployLending.s.sol or cast run ---");
    }
}
