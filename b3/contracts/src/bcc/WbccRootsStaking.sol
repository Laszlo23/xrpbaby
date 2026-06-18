// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BccRootsStaking} from "./BccRootsStaking.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title WbccRootsStaking
/// @notice wBCC staking on BSC — same tier logic as BccRootsStaking on Base.
contract WbccRootsStaking is BccRootsStaking {
    constructor(
        address admin,
        IERC20 wbccToken,
        uint256 cooldownPeriod_,
        string[3] memory names,
        uint256[3] memory lockDurations,
        uint256[3] memory weightBpsList
    ) BccRootsStaking(admin, wbccToken, cooldownPeriod_, names, lockDurations, weightBpsList) {}
}
