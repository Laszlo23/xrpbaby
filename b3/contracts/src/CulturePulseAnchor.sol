// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Daily digest anchor for Culture Pulse transparency (off-chain JSON at metadataUri).
contract CulturePulseAnchor is Ownable {
    mapping(uint256 => bytes32) public dayDigest;
    mapping(uint256 => string) public dayMetadataUri;

    event DayAttested(
        uint256 indexed dayId,
        bytes32 indexed digest,
        string metadataUri,
        address indexed attestor
    );

    constructor(address initialOwner) Ownable(initialOwner) {}

    /// @param dayId UTC day as YYYYMMDD integer (e.g. 20260523).
    /// @param digest keccak256 of canonical metrics JSON.
    function attestDay(uint256 dayId, bytes32 digest, string calldata metadataUri) external onlyOwner {
        require(dayId > 0, "day");
        require(digest != bytes32(0), "digest");
        dayDigest[dayId] = digest;
        dayMetadataUri[dayId] = metadataUri;
        emit DayAttested(dayId, digest, metadataUri, msg.sender);
    }
}
