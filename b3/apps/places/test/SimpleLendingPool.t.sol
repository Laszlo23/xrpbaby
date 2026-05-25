// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {WETH9} from "../src/defi/WETH9.sol";
import {MockPriceOracle} from "../src/defi/MockPriceOracle.sol";
import {SimpleLendingPool} from "../src/defi/SimpleLendingPool.sol";

contract CollateralToken is ERC20 {
    constructor() ERC20("COL", "COL") {
        _mint(msg.sender, 1_000_000 ether);
    }
}

contract SimpleLendingPoolTest is Test {
    WETH9 internal weth;
    CollateralToken internal col;
    MockPriceOracle internal oracle;
    SimpleLendingPool internal pool;

    address internal user = address(0xBEEF);
    address internal admin = address(0xA11);

    function setUp() public {
        weth = new WETH9();
        col = new CollateralToken();
        oracle = new MockPriceOracle(admin);
        vm.prank(admin);
        oracle.setPrice(address(col), 2e18);

        pool = new SimpleLendingPool(address(col), address(weth), address(oracle));

        vm.deal(address(this), 200 ether);
        weth.deposit{value: 100 ether}();
        IERC20(address(weth)).transfer(address(pool), 100 ether);

        col.transfer(user, 100_000 ether);
        vm.deal(user, 100 ether);
        vm.startPrank(user);
        col.approve(address(pool), type(uint256).max);
        weth.deposit{value: 50 ether}();
        IERC20(address(weth)).approve(address(pool), type(uint256).max);
        vm.stopPrank();

        vm.prank(user);
        pool.depositCollateral(10 ether);

        vm.prank(user);
        pool.borrow(5 ether);
    }

    function testBorrow() public {
        assertEq(pool.debtOf(user), 5 ether);
        assertEq(IERC20(address(weth)).balanceOf(user), 55 ether);
    }
}
