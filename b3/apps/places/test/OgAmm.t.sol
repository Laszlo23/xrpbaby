// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {OgFactory} from "../src/defi/OgFactory.sol";
import {OgRouter} from "../src/defi/OgRouter.sol";
import {WETH9} from "../src/defi/WETH9.sol";

contract TestToken is ERC20 {
    constructor() ERC20("T", "T") {
        _mint(msg.sender, 10_000_000 ether);
    }
}

contract OgAmmTest is Test {
    OgFactory internal factory;
    OgRouter internal router;
    WETH9 internal weth;
    TestToken internal token;

    address internal user = address(0xBEEF);

    function setUp() public {
        weth = new WETH9();
        factory = new OgFactory();
        router = new OgRouter(address(factory), address(weth));
        token = new TestToken();
        token.transfer(user, 10_000_000 ether);

        vm.deal(user, 100 ether);
        vm.startPrank(user);
        weth.deposit{value: 10 ether}();
        token.approve(address(router), type(uint256).max);
        IERC20(address(weth)).approve(address(router), type(uint256).max);
        vm.stopPrank();
    }

    function testAddLiquidityAndSwap() public {
        vm.startPrank(user);
        router.addLiquidity(
            address(weth),
            address(token),
            5 ether,
            5000 ether,
            0,
            0,
            user,
            block.timestamp + 1
        );

        address pair = factory.getPair(address(weth), address(token));
        assertGt(IERC20(pair).balanceOf(user), 0);

        address buyer = address(0xCAFE);
        deal(buyer, 10 ether);
        vm.stopPrank();

        vm.startPrank(buyer);
        weth.deposit{value: 1 ether}();
        IERC20(address(weth)).approve(address(router), type(uint256).max);
        uint256 out = router.swapExactTokensForTokens(
            1 ether, 0, address(weth), address(token), buyer, block.timestamp + 1
        );
        vm.stopPrank();

        assertGt(out, 0);
        assertGt(token.balanceOf(buyer), 0);
    }

    function testRemoveLiquidity() public {
        vm.startPrank(user);
        router.addLiquidity(
            address(weth),
            address(token),
            5 ether,
            5000 ether,
            0,
            0,
            user,
            block.timestamp + 1
        );
        address pair = factory.getPair(address(weth), address(token));
        uint256 lp = IERC20(pair).balanceOf(user);
        assertGt(lp, 0);
        IERC20(pair).approve(address(router), type(uint256).max);

        uint256 wBefore = IERC20(address(weth)).balanceOf(user);
        uint256 tBefore = token.balanceOf(user);
        (uint256 a0, uint256 a1) = router.removeLiquidity(
            address(weth), address(token), lp, 0, 0, user, block.timestamp + 1
        );
        vm.stopPrank();

        assertGt(a0, 0);
        assertGt(a1, 0);
        assertEq(IERC20(pair).balanceOf(user), 0);
        assertGt(IERC20(address(weth)).balanceOf(user), wBefore);
        assertGt(token.balanceOf(user), tBefore);
    }

    function testRemoveLiquidityETH() public {
        vm.startPrank(user);
        router.addLiquidity(
            address(weth),
            address(token),
            5 ether,
            5000 ether,
            0,
            0,
            user,
            block.timestamp + 1
        );
        address pair = factory.getPair(address(weth), address(token));
        uint256 lp = IERC20(pair).balanceOf(user);
        IERC20(pair).approve(address(router), type(uint256).max);

        uint256 ethBefore = user.balance;
        uint256 tBefore = token.balanceOf(user);
        (uint256 aTok, uint256 aEth) =
            router.removeLiquidityETH(address(token), lp, 0, 0, user, block.timestamp + 1);
        vm.stopPrank();

        assertGt(aTok, 0);
        assertGt(aEth, 0);
        assertGt(user.balance, ethBefore);
        assertGt(token.balanceOf(user), tBefore);
    }
}
