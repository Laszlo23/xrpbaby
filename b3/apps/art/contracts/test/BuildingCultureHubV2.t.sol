// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {BuildingCultureTicket} from "../src/BuildingCultureTicket.sol";
import {BuildingCultureHubV2} from "../src/BuildingCultureHubV2.sol";
import {IBccUsdOracle} from "../src/bcc/IBccUsdOracle.sol";

contract MockBcc is ERC20 {
    constructor() ERC20("Building Culture Coin", "BCC") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract MockOracle is IBccUsdOracle {
    uint256 public bccWeiPerUsdE6;

    constructor(uint256 rate_) {
        bccWeiPerUsdE6 = rate_;
    }

    function bccAmountForUsd(uint256 usdE6) external view returns (uint256) {
        return (usdE6 * bccWeiPerUsdE6) / 1e6;
    }
}

contract BuildingCultureHubV2Test is Test {
    BuildingCultureTicket internal tickets;
    BuildingCultureHubV2 internal hub;
    MockBcc internal bcc;
    MockOracle internal oracle;

    address internal treasury = address(0xBEEF);
    address internal alice = address(0xA11CE);

    function setUp() public {
        bcc = new MockBcc();
        oracle = new MockOracle(1e18);
        tickets = new BuildingCultureTicket(address(this));
        hub = new BuildingCultureHubV2(address(tickets), address(bcc), address(oracle), treasury, address(this));
        tickets.setHub(address(hub));
        hub.createEdition("horizon", 0.001 ether, 1_800_000, 3, address(this));
        bcc.mint(alice, 1000 ether);
    }

    function test_QuoteAndMintWithBcc() public {
        uint256 quote = hub.quoteTicketsWithBcc(0, 2);
        uint256 full = oracle.bccAmountForUsd(1_800_000 * 2);
        assertEq(quote, (full * 8889) / 10_000);

        vm.startPrank(alice);
        bcc.approve(address(hub), quote);
        hub.mintTicketsWithBcc(0, 2);
        vm.stopPrank();

        assertEq(bcc.balanceOf(treasury), quote);
        (, , , , uint32 sold, , , , , ) = hub.getEdition(0);
        assertEq(sold, 2);
    }
}
