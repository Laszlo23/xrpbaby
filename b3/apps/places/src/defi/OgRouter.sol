// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {OgFactory} from "./OgFactory.sol";
import {OgPair} from "./OgPair.sol";
import {WETH9} from "./WETH9.sol";

/// @notice Router for OgFactory pairs and WETH wrap/unwrap (single-hop swaps).
contract OgRouter is ReentrancyGuard {
    OgFactory public immutable factory;
    WETH9 public immutable WETH;

    error Expired();
    error InsufficientAmount();
    error InsufficientLiquidity();

    modifier ensure(uint256 deadline) {
        if (block.timestamp > deadline) revert Expired();
        _;
    }

    constructor(address factory_, address weth_) {
        factory = OgFactory(factory_);
        WETH = WETH9(payable(weth_));
    }

    function _sort(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
    }

    function getPair(address tokenA, address tokenB) public view returns (address) {
        (address t0, address t1) = _sort(tokenA, tokenB);
        return factory.getPair(t0, t1);
    }

    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut)
        public
        pure
        returns (uint256 amountOut)
    {
        uint256 amountInWithFee = amountIn * 997;
        amountOut = (amountInWithFee * reserveOut) / (reserveIn * 1000 + amountInWithFee);
    }

    function _quote(uint256 amountA, uint256 reserveA, uint256 reserveB) private pure returns (uint256 amountB) {
        amountB = (amountA * reserveB) / reserveA;
    }

    /// @notice Add liquidity; creates pair if needed. `tokenA`/`tokenB` are unsorted.
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external nonReentrant ensure(deadline) returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        address pair = getPair(tokenA, tokenB);
        if (pair == address(0)) {
            pair = factory.createPair(tokenA, tokenB);
        }

        (address token0, address token1) = _sort(tokenA, tokenB);
        (uint256 reserve0, uint256 reserve1,) = OgPair(pair).getReserves();

        uint256 amount0Desired = tokenA == token0 ? amountADesired : amountBDesired;
        uint256 amount1Desired = tokenA == token0 ? amountBDesired : amountADesired;
        uint256 amount0Min = tokenA == token0 ? amountAMin : amountBMin;
        uint256 amount1Min = tokenA == token0 ? amountBMin : amountAMin;

        uint256 amount0;
        uint256 amount1;
        if (reserve0 == 0 && reserve1 == 0) {
            amount0 = amount0Desired;
            amount1 = amount1Desired;
        } else {
            uint256 amount1Optimal = _quote(amount0Desired, reserve0, reserve1);
            if (amount1Optimal <= amount1Desired) {
                if (amount0Desired < amount0Min || amount1Optimal < amount1Min) revert InsufficientAmount();
                (amount0, amount1) = (amount0Desired, amount1Optimal);
            } else {
                uint256 amount0Optimal = _quote(amount1Desired, reserve1, reserve0);
                if (amount0Optimal > amount0Desired || amount0Optimal < amount0Min || amount1Desired < amount1Min) {
                    revert InsufficientAmount();
                }
                (amount0, amount1) = (amount0Optimal, amount1Desired);
            }
        }

        (amountA, amountB) = tokenA == token0 ? (amount0, amount1) : (amount1, amount0);

        IERC20(token0).transferFrom(msg.sender, pair, amount0);
        IERC20(token1).transferFrom(msg.sender, pair, amount1);
        liquidity = OgPair(pair).mint(to);
    }

    /// @notice Remove liquidity; LP tokens are pulled from `msg.sender` and burned on the pair.
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external nonReentrant ensure(deadline) returns (uint256 amountA, uint256 amountB) {
        address pair = getPair(tokenA, tokenB);
        if (pair == address(0)) revert InsufficientLiquidity();

        IERC20(pair).transferFrom(msg.sender, pair, liquidity);
        (uint256 amount0, uint256 amount1) = OgPair(pair).burn(to);
        (address token0,) = _sort(tokenA, tokenB);
        (amountA, amountB) = tokenA == token0 ? (amount0, amount1) : (amount1, amount0);
        if (amountA < amountAMin || amountB < amountBMin) revert InsufficientAmount();
    }

    /// @notice Remove liquidity for a token / WETH pair; unwraps WETH to ETH for `to`.
    function removeLiquidityETH(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external nonReentrant ensure(deadline) returns (uint256 amountToken, uint256 amountETH) {
        address pair = getPair(token, address(WETH));
        if (pair == address(0)) revert InsufficientLiquidity();

        IERC20(pair).transferFrom(msg.sender, pair, liquidity);
        (uint256 amount0, uint256 amount1) = OgPair(pair).burn(address(this));
        (address token0,) = _sort(token, address(WETH));
        if (token == token0) {
            (amountToken, amountETH) = (amount0, amount1);
        } else {
            (amountToken, amountETH) = (amount1, amount0);
        }
        if (amountToken < amountTokenMin || amountETH < amountETHMin) revert InsufficientAmount();

        IERC20(token).transfer(to, amountToken);
        WETH.withdraw(amountETH);
        (bool ok,) = to.call{value: amountETH}("");
        require(ok, "ETH send failed");
    }

    /// @notice Swap exact `amountIn` of tokenIn for tokenOut (single hop).
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address tokenIn,
        address tokenOut,
        address to,
        uint256 deadline
    ) external nonReentrant ensure(deadline) returns (uint256 amountOut) {
        address pair = getPair(tokenIn, tokenOut);
        if (pair == address(0)) revert InsufficientLiquidity();

        IERC20 tIn = IERC20(tokenIn);
        (uint256 reserve0, uint256 reserve1,) = OgPair(pair).getReserves();
        (address token0,) = _sort(tokenIn, tokenOut);
        (uint256 reserveIn, uint256 reserveOut) =
            tokenIn == token0 ? (reserve0, reserve1) : (reserve1, reserve0);

        amountOut = getAmountOut(amountIn, reserveIn, reserveOut);
        if (amountOut < amountOutMin) revert InsufficientAmount();

        tIn.transferFrom(msg.sender, pair, amountIn);
        (uint256 amount0Out, uint256 amount1Out) =
            tokenIn == token0 ? (uint256(0), amountOut) : (amountOut, uint256(0));
        OgPair(pair).swap(amount0Out, amount1Out, to);
    }

    function swapExactETHForTokens(uint256 amountOutMin, address tokenOut, address to, uint256 deadline)
        external
        payable
        nonReentrant
        ensure(deadline)
        returns (uint256 amountOut)
    {
        address pair = getPair(address(WETH), tokenOut);
        if (pair == address(0)) revert InsufficientLiquidity();

        WETH.deposit{value: msg.value}();
        IERC20 w = IERC20(address(WETH));
        (uint256 reserve0, uint256 reserve1,) = OgPair(pair).getReserves();
        (address token0,) = _sort(address(WETH), tokenOut);
        (uint256 reserveIn, uint256 reserveOut) =
            address(WETH) == token0 ? (reserve0, reserve1) : (reserve1, reserve0);

        amountOut = getAmountOut(msg.value, reserveIn, reserveOut);
        if (amountOut < amountOutMin) revert InsufficientAmount();

        w.transfer(pair, msg.value);
        (uint256 amount0Out, uint256 amount1Out) =
            address(WETH) == token0 ? (uint256(0), amountOut) : (amountOut, uint256(0));
        OgPair(pair).swap(amount0Out, amount1Out, to);
    }

    function swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address tokenIn, address to, uint256 deadline)
        external
        nonReentrant
        ensure(deadline)
        returns (uint256 amountOut)
    {
        address pair = getPair(tokenIn, address(WETH));
        if (pair == address(0)) revert InsufficientLiquidity();

        IERC20 tIn = IERC20(tokenIn);
        (uint256 reserve0, uint256 reserve1,) = OgPair(pair).getReserves();
        (address token0,) = _sort(tokenIn, address(WETH));
        (uint256 reserveIn, uint256 reserveOut) =
            tokenIn == token0 ? (reserve0, reserve1) : (reserve1, reserve0);

        amountOut = getAmountOut(amountIn, reserveIn, reserveOut);
        if (amountOut < amountOutMin) revert InsufficientAmount();

        tIn.transferFrom(msg.sender, pair, amountIn);
        (uint256 amount0Out, uint256 amount1Out) =
            tokenIn == token0 ? (uint256(0), amountOut) : (amountOut, uint256(0));
        OgPair(pair).swap(amount0Out, amount1Out, address(this));
        WETH.withdraw(amountOut);
        (bool ok,) = to.call{value: amountOut}("");
        require(ok, "ETH send failed");
    }

    receive() external payable {}
}
