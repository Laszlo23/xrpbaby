// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @notice Uniswap V2-style constant-product pair (0.3% fee).
contract OgPair is ERC20, ReentrancyGuard {
    uint256 public constant MINIMUM_LIQUIDITY = 10 ** 3;

    address public immutable factory;
    address public immutable token0;
    address public immutable token1;

    uint112 private reserve0;
    uint112 private reserve1;
    uint32 private blockTimestampLast;

    event Mint(address indexed sender, uint256 amount0, uint256 amount1);
    event Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to);
    event Swap(
        address indexed sender,
        uint256 amount0In,
        uint256 amount1In,
        uint256 amount0Out,
        uint256 amount1Out,
        address indexed to
    );
    event Sync(uint112 reserve0, uint112 reserve1);

    error InsufficientLiquidity();
    error InsufficientOutput();
    error InvalidTo();
    error UniswapV2K();

    constructor(address token0_, address token1_) ERC20("OgSwap LP", "OG-LP") {
        factory = msg.sender;
        token0 = token0_;
        token1 = token1_;
    }

    function getReserves() public view returns (uint112 r0, uint112 r1, uint32 _blockTimestampLast) {
        r0 = reserve0;
        r1 = reserve1;
        _blockTimestampLast = blockTimestampLast;
    }

    function _update(uint256 balance0, uint256 balance1) private {
        reserve0 = uint112(balance0);
        reserve1 = uint112(balance1);
        blockTimestampLast = uint32(block.timestamp);
        emit Sync(reserve0, reserve1);
    }

    function mint(address to) external nonReentrant returns (uint256 liquidity) {
        (uint112 r0, uint112 r1,) = getReserves();
        uint256 balance0 = IERC20(token0).balanceOf(address(this));
        uint256 balance1 = IERC20(token1).balanceOf(address(this));
        uint256 amount0 = balance0 - uint256(r0);
        uint256 amount1 = balance1 - uint256(r1);

        uint256 _totalSupply = totalSupply();
        if (_totalSupply == 0) {
            liquidity = _sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
            _mint(address(0xdead), MINIMUM_LIQUIDITY);
        } else {
            liquidity = _min((amount0 * _totalSupply) / uint256(r0), (amount1 * _totalSupply) / uint256(r1));
        }
        if (liquidity == 0) revert InsufficientLiquidity();
        _mint(to, liquidity);
        _update(balance0, balance1);
        emit Mint(msg.sender, amount0, amount1);
    }

    function burn(address to) external nonReentrant returns (uint256 amount0, uint256 amount1) {
        IERC20 t0 = IERC20(token0);
        IERC20 t1 = IERC20(token1);
        uint256 balance0 = t0.balanceOf(address(this));
        uint256 balance1 = t1.balanceOf(address(this));
        uint256 liquidity = balanceOf(address(this));

        amount0 = (liquidity * balance0) / totalSupply();
        amount1 = (liquidity * balance1) / totalSupply();
        if (amount0 == 0 || amount1 == 0) revert InsufficientLiquidity();
        _burn(address(this), liquidity);
        t0.transfer(to, amount0);
        t1.transfer(to, amount1);
        balance0 = t0.balanceOf(address(this));
        balance1 = t1.balanceOf(address(this));
        _update(balance0, balance1);
        emit Burn(msg.sender, amount0, amount1, to);
    }

    function swap(uint256 amount0Out, uint256 amount1Out, address to) external nonReentrant {
        if (amount0Out == 0 && amount1Out == 0) revert InsufficientOutput();
        (uint112 r0, uint112 r1,) = getReserves();
        if (amount0Out >= uint256(r0) || amount1Out >= uint256(r1)) revert InsufficientLiquidity();
        if (to == token0 || to == token1) revert InvalidTo();

        IERC20 t0 = IERC20(token0);
        IERC20 t1 = IERC20(token1);
        if (amount0Out > 0) t0.transfer(to, amount0Out);
        if (amount1Out > 0) t1.transfer(to, amount1Out);

        uint256 balance0 = t0.balanceOf(address(this));
        uint256 balance1 = t1.balanceOf(address(this));

        uint256 amount0In = balance0 > uint256(r0) - amount0Out ? balance0 - (uint256(r0) - amount0Out) : 0;
        uint256 amount1In = balance1 > uint256(r1) - amount1Out ? balance1 - (uint256(r1) - amount1Out) : 0;

        uint256 balance0Adjusted = balance0 * 1000 - amount0In * 3;
        uint256 balance1Adjusted = balance1 * 1000 - amount1In * 3;
        if (balance0Adjusted * balance1Adjusted < uint256(r0) * uint256(r1) * 1000 ** 2) revert UniswapV2K();

        _update(balance0, balance1);
        emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
    }

    function _sqrt(uint256 y) private pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function _min(uint256 a, uint256 b) private pure returns (uint256) {
        return a < b ? a : b;
    }
}
