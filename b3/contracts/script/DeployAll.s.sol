// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {AgentShareCampaign} from "../src/AgentShareCampaign.sol";
import {BCDFixedPriceSale} from "../src/BCDFixedPriceSale.sol";
import {BCDGenesisClaim} from "../src/BCDGenesisClaim.sol";
import {BuildingCultureDollar} from "../src/BuildingCultureDollar.sol";
import {RaffleTicketCampaign} from "../src/RaffleTicketCampaign.sol";

/// @notice One broadcast session: optional raffle, agent shares, BCD+genesis (set DEPLOY_*=0 to skip).
contract DeployAllScript is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);

        bool deployRaffle = vm.envOr("DEPLOY_RAFFLE", uint256(1)) != 0;
        bool deployAgent = vm.envOr("DEPLOY_AGENT_SHARE", uint256(1)) != 0;
        bool deployBcd = vm.envOr("DEPLOY_BCD", uint256(1)) != 0;
        bool deployBcdSale = vm.envOr("DEPLOY_BCD_FIXED_SALE", uint256(0)) != 0;

        address treasury = vm.envAddress("TREASURY");

        vm.startBroadcast(pk);

        if (deployRaffle) {
            uint256 priceWei = vm.envOr("MINT_PRICE_WEI", uint256(0.001 ether));
            uint256 maxSupply = vm.envOr("MAX_SUPPLY", uint256(1000));
            string memory baseUriRaffle = vm.envOr("BASE_URI", string("https://0x.buildingculture.capital/ipfs/"));

            RaffleTicketCampaign raffle = new RaffleTicketCampaign(
                "BUILDCHAIN Ticket", "BCTIX", priceWei, maxSupply, treasury, baseUriRaffle, deployer
            );
            console.log("RaffleTicketCampaign:", address(raffle));
        } else {
            console.log("RaffleTicketCampaign: skipped (DEPLOY_RAFFLE=0)");
        }

        if (deployAgent) {
            address liquidityVault = vm.envAddress("LIQUIDITY_VAULT");
            uint256 mintPriceWei = vm.envOr("AGENT_MINT_PRICE_WEI", uint256(0.005 ether));
            uint256 dailyCap = vm.envOr("AGENT_DAILY_MINT_CAP", uint256(500));
            uint16 liquidityBps = uint16(vm.envOr("AGENT_LIQUIDITY_BPS", uint256(500)));
            uint16 referrerBps = uint16(vm.envOr("AGENT_REFERRER_BPS", uint256(500)));
            string memory baseUriAgent = vm.envOr("AGENT_BASE_URI", string("https://0x.buildingculture.capital/meta/agent/"));

            AgentShareCampaign agent = new AgentShareCampaign(
                "BUILDCHAIN Agent Share",
                "BCAGENT",
                mintPriceWei,
                dailyCap,
                treasury,
                liquidityVault,
                liquidityBps,
                referrerBps,
                baseUriAgent,
                deployer
            );
            console.log("AgentShareCampaign:", address(agent));
        } else {
            console.log("AgentShareCampaign: skipped (DEPLOY_AGENT_SHARE=0)");
        }

        if (deployBcd) {
            uint256 cap = vm.envOr("BCD_CAP", uint256(1_000_000 ether));
            bytes32 merkleRoot = vm.envBytes32("GENESIS_MERKLE_ROOT");
            uint256 claimFeeWei = vm.envOr("GENESIS_CLAIM_FEE_WEI", uint256(0));
            uint256 endsAt = vm.envOr("GENESIS_ENDS_AT", uint256(0));

            BuildingCultureDollar token = new BuildingCultureDollar(deployer, cap);
            BCDGenesisClaim claim = new BCDGenesisClaim(
                deployer, address(token), treasury, merkleRoot, claimFeeWei, endsAt
            );
            token.setGenesisClaimContract(address(claim));
            console.log("BuildingCultureDollar:", address(token));
            console.log("BCDGenesisClaim:", address(claim));

            if (deployBcdSale) {
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
        } else {
            console.log("BCD stack: skipped (DEPLOY_BCD=0)");
        }

        vm.stopBroadcast();
    }
}
