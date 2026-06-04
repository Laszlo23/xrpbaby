// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IBccUsdOracle} from "./IBccUsdOracle.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @dev Admin-set BCC/USD for testnet or until TWAP pool is wired.
contract MockBccUsdOracle is IBccUsdOracle, Ownable {
    /// @notice BCC wei required per 1 USD (6 decimals), e.g. 1e18 BCC per $1.
    uint256 public bccWeiPerUsdE6;

    constructor(uint256 bccWeiPerUsdE6_, address owner_) Ownable(owner_) {
        bccWeiPerUsdE6 = bccWeiPerUsdE6_;
    }

    function setBccWeiPerUsdE6(uint256 v) external onlyOwner {
        bccWeiPerUsdE6 = v;
    }

    function bccAmountForUsd(uint256 usdE6) external view returns (uint256) {
        return (usdE6 * bccWeiPerUsdE6) / 1e6;
    }
}
