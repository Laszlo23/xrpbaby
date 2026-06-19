// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Daily culture well spin — records self-reported tier (1–33) once per UTC day for points proof.
contract CultureSpinningWell {
    mapping(address => uint256) public lastSpinDay;

    event WellSpun(address indexed user, uint256 dayIndex, uint8 value);

    error CultureSpinningWell__AlreadySpun();
    error CultureSpinningWell__InvalidValue();

    function spin(uint8 value) external {
        if (value < 1 || value > 33) revert CultureSpinningWell__InvalidValue();

        uint256 day = block.timestamp / 86_400;
        uint256 last = lastSpinDay[msg.sender];
        if (last != 0 && last == day) revert CultureSpinningWell__AlreadySpun();

        lastSpinDay[msg.sender] = day;
        emit WellSpun(msg.sender, day, value);
    }
}
