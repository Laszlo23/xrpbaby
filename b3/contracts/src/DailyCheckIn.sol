// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice One check-in per UTC-based day bucket (timestamp / 86400). Used for daily quest verification.
contract DailyCheckIn {
    mapping(address => uint256) public lastCheckInDay;

    event CheckedIn(address indexed user, uint256 dayIndex);

    error DailyCheckIn__AlreadyCheckedIn();

    function checkIn() external {
        uint256 day = block.timestamp / 86400;
        if (lastCheckInDay[msg.sender] == day) revert DailyCheckIn__AlreadyCheckedIn();
        lastCheckInDay[msg.sender] = day;
        emit CheckedIn(msg.sender, day);
    }
}
