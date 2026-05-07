// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {BCDFixedPriceSale} from "../src/BCDFixedPriceSale.sol";
import {BuildingCultureDollar} from "../src/BuildingCultureDollar.sol";
import {BCDGenesisClaim} from "../src/BCDGenesisClaim.sol";

/// @notice Deploy capped BCD ERC20 + merkle genesis claim, then authorize claim on token.
///         Optional fixed-price sale: DEPLOY_BCD_FIXED_SALE=1 and BCD_SALE_PAYMENT_TOKEN (0 = native ETH).
contract DeployBCDScript is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);
        address treasury = vm.envAddress("TREASURY");
        uint256 cap = vm.envOr("BCD_CAP", uint256(1_000_000 ether));
        /// @dev `keccak256(abi.encode(wallet, weiAllocation))` tree root (`0x` + 64 hex). Use zeros for dormant deploy (no proofs verify).
        bytes32 merkleRoot = vm.envBytes32("GENESIS_MERKLE_ROOT");
        uint256 claimFeeWei = vm.envOr("GENESIS_CLAIM_FEE_WEI", uint256(0));
        uint256 endsAt = vm.envOr("GENESIS_ENDS_AT", uint256(0));
        bool deploySale = vm.envOr("DEPLOY_BCD_FIXED_SALE", uint256(0)) != 0;

        vm.startBroadcast(pk);

        BuildingCultureDollar token = new BuildingCultureDollar(deployer, cap);

        BCDGenesisClaim claim =
            new BCDGenesisClaim(deployer, address(token), treasury, merkleRoot, claimFeeWei, endsAt);

        token.setGenesisClaimContract(address(claim));

        if (deploySale) {
            address payTok;
            try vm.envAddress("BCD_SALE_PAYMENT_TOKEN") returns (address p) {
                payTok = p;
            } catch {
                payTok = address(0);
            }
            BCDFixedPriceSale sale = new BCDFixedPriceSale(deployer, address(token), treasury, payTok);
            token.setFixedSaleContract(address(sale));
            console.log("BCDFixedPriceSale:", address(sale));
        }

        vm.stopBroadcast();

        console.log("BuildingCultureDollar:", address(token));
        console.log("BCDGenesisClaim:", address(claim));
    }
}
