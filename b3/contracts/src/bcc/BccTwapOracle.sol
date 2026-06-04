// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IBccUsdOracle} from "./IBccUsdOracle.sol";

interface IUniswapV3Pool {
    function token0() external view returns (address);
    function token1() external view returns (address);
    function observe(uint32[] calldata secondsAgos)
        external
        view
        returns (int56[] memory tickCumulatives, uint160[] memory);
}

interface AggregatorV3Interface {
    function latestRoundData()
        external
        view
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);
}

/// @title BccTwapOracle — BCC/USD via Uniswap V3 TWAP (BCC/WETH) + Chainlink ETH/USD
/// @dev Pool must be BCC paired with WETH. Configure `bccPool` at deploy; optional `ethUsdFeed` on Base.
contract BccTwapOracle is IBccUsdOracle, Ownable {
    address public immutable bccToken;
    IUniswapV3Pool public immutable bccWethPool;
    AggregatorV3Interface public ethUsdFeed;
    uint32 public twapPeriod = 1800;
    uint256 public maxFeedStaleness = 1 hours;

    error StaleFeed();
    error InvalidPool();
    error ZeroPrice();

    constructor(
        address bccToken_,
        address bccWethPool_,
        address ethUsdFeed_,
        address initialOwner
    ) Ownable(initialOwner) {
        bccToken = bccToken_;
        bccWethPool = IUniswapV3Pool(bccWethPool_);
        ethUsdFeed = AggregatorV3Interface(ethUsdFeed_);
        if (bccWethPool.token0() != bccToken_ && bccWethPool.token1() != bccToken_) revert InvalidPool();
    }

    function setEthUsdFeed(address feed) external onlyOwner {
        ethUsdFeed = AggregatorV3Interface(feed);
    }

    function setTwapPeriod(uint32 seconds_) external onlyOwner {
        require(seconds_ >= 300, "min 5m");
        twapPeriod = seconds_;
    }

    /// @inheritdoc IBccUsdOracle
    function bccAmountForUsd(uint256 usdE6) external view returns (uint256 bccAmount) {
        if (usdE6 == 0) return 0;
        uint256 bccPerWethE18 = _bccPerWethE18();
        uint256 ethUsdE8 = _ethUsdE8();
        // bccUsdE18 = bccPerWethE18 * ethUsdE8 / 1e8
        uint256 bccUsdE18 = (bccPerWethE18 * ethUsdE8) / 1e8;
        if (bccUsdE18 == 0) revert ZeroPrice();
        // bccAmount = usdE6 * 1e18 * 1e18 / (bccUsdE18 * 1e6)
        bccAmount = (usdE6 * 1e30) / (bccUsdE18 * 1e6);
    }

    function _ethUsdE8() internal view returns (uint256) {
        (, int256 answer,, uint256 updatedAt,) = ethUsdFeed.latestRoundData();
        if (answer <= 0) revert ZeroPrice();
        if (block.timestamp - updatedAt > maxFeedStaleness) revert StaleFeed();
        return uint256(answer);
    }

    function _bccPerWethE18() internal view returns (uint256) {
        uint32[] memory secs = new uint32[](2);
        secs[0] = twapPeriod;
        secs[1] = 0;
        (int56[] memory ticks,) = bccWethPool.observe(secs);
        int56 tick = (ticks[1] - ticks[0]) / int56(uint56(twapPeriod));
        return _getQuoteAtTick(int56(tick), 1e18, bccToken, address(0)); // WETH implied via pool orientation
    }

    /// @dev Uniswap V3 TickMath quote — amount of `baseToken` per 1e18 quote when base is BCC and quote is WETH.
    function _getQuoteAtTick(int56 tick, uint128 baseAmount, address baseToken, address)
        internal
        view
        returns (uint256 quoteAmount)
    {
        uint160 sqrtRatioX96 = _getSqrtRatioAtTick(tick);
        address token0 = bccWethPool.token0();
        if (baseToken == token0) {
            // amount1 = amount0 * (sqrtPrice^2) / 2^192
            quoteAmount = _mulDiv(baseAmount, uint256(sqrtRatioX96) * uint256(sqrtRatioX96), 1 << 192);
        } else {
            // amount0 = amount1 * 2^192 / (sqrtPrice^2)
            quoteAmount = _mulDiv(baseAmount, 1 << 192, uint256(sqrtRatioX96) * uint256(sqrtRatioX96));
        }
    }

    function _getSqrtRatioAtTick(int56 tick) internal pure returns (uint160 sqrtPriceX96) {
        uint256 absTick = tick < 0 ? uint256(-int256(tick)) : uint256(int256(tick));
        require(absTick <= uint256(int256(887272)), "T");
        uint256 ratio = absTick & 0x1 != 0 ? 0xfffcb933bd6fad37aa2d162d1a594001 : 0x100000000000000000000000000000000;
        if (absTick & 0x2 != 0) ratio = (ratio * 0xfff97272373d413259a46990580e213a) >> 128;
        if (absTick & 0x4 != 0) ratio = (ratio * 0xfff2e50f5f656932ef12357cf3c7fdcc) >> 128;
        if (absTick & 0x8 != 0) ratio = (ratio * 0xffe5caca7e10e4e61c3624eaa0941cd0) >> 128;
        if (absTick & 0x10 != 0) ratio = (ratio * 0xffcb9843d60f6159c9db58835c926644) >> 128;
        if (absTick & 0x20 != 0) ratio = (ratio * 0xff973b41fa98c081472e6896dfb254c0) >> 128;
        if (absTick & 0x40 != 0) ratio = (ratio * 0xff2ea16466c96a3843ec78b326b52861) >> 128;
        if (absTick & 0x80 != 0) ratio = (ratio * 0xfe5dee046a99a2a811c461f1637b57fa) >> 128;
        if (absTick & 0x100 != 0) ratio = (ratio * 0xfcbe86c7900eb88acfe982fc0d89ac2a) >> 128;
        if (absTick & 0x200 != 0) ratio = (ratio * 0xf987a7253ac413176f2b074cf7815e54) >> 128;
        if (absTick & 0x400 != 0) ratio = (ratio * 0xf3392b0822b70005940c7a398e4b70f3) >> 128;
        if (absTick & 0x800 != 0) ratio = (ratio * 0xe7159475a2c69b3e7736099b892ba588) >> 128;
        if (absTick & 0x1000 != 0) ratio = (ratio * 0xd097f3bdfd2022b8845ad8f792aa5825) >> 128;
        if (absTick & 0x2000 != 0) ratio = (ratio * 0xa9f746462d870fdf8a65dc1f90e061e5) >> 128;
        if (absTick & 0x4000 != 0) ratio = (ratio * 0x70d869a156d2a1b890bb3df62baf32f7) >> 128;
        if (absTick & 0x8000 != 0) ratio = (ratio * 0x31be135f97d08fd981231505056fc272) >> 128;
        if (absTick & 0x10000 != 0) ratio = (ratio * 0x9aa508b5b7a84e1c677de54) >> 128;
        if (absTick & 0x20000 != 0) ratio = (ratio * 0x5d6af8dedb81196699c329225) >> 128;
        if (absTick & 0x40000 != 0) ratio = (ratio * 0x2216e584f5fa1ea926041bed) >> 128;
        if (absTick & 0x80000 != 0) ratio = (ratio * 0x48a170391f7dc42444e8fa2) >> 128;
        if (tick > 0) ratio = type(uint256).max / ratio;
        sqrtPriceX96 = uint160((ratio >> 32) + (ratio % (1 << 32) == 0 ? 0 : 1));
    }

    function _mulDiv(uint256 a, uint256 b, uint256 denominator) internal pure returns (uint256 result) {
        result = (a * b) / denominator;
    }
}
