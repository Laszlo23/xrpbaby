// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {CultureLayerIdentityV2} from "../src/CultureLayerIdentityV2.sol";
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

contract CultureLayerIdentityV2Test is Test {
    CultureLayerIdentityV2 internal nft;
    MockBcc internal bcc;
    MockOracle internal oracle;

    address internal treasury = address(0xBEEF);
    address internal alice = address(0xA11CE);

    uint256 constant PRICE = 370_000_000_000_000;

    function setUp() public {
        bcc = new MockBcc();
        oracle = new MockOracle(1e18);
        nft = new CultureLayerIdentityV2(address(this), PRICE, address(bcc), address(oracle), treasury);
        bcc.mint(alice, 1000 ether);
        vm.deal(alice, 10 ether);
    }

    function test_MintWithBccAppliesDiscount() public {
        uint256 quoted = nft.quoteMintWithBcc();
        uint256 full = oracle.bccAmountForUsd(1_110_000);
        assertEq(quoted, (full * 8889) / 10_000);

        vm.startPrank(alice);
        bcc.approve(address(nft), quoted);
        uint256 id = nft.mintWithBcc("laszlo", 0);
        vm.stopPrank();

        assertEq(id, 1);
        assertEq(bcc.balanceOf(treasury), quoted);
        assertEq(nft.ownerOf(1), alice);
    }

    function test_NativeMintStillWorks() public {
        vm.prank(alice);
        uint256 id = nft.mint{value: PRICE}("native", 0);
        assertEq(id, 1);
        assertEq(nft.ownerOf(1), alice);
    }
}
