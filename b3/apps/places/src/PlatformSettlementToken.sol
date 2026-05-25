// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/// @title PlatformSettlementToken
/// @notice Fixed-supply ERC-20 minted once to `receiver` for protocol checkout on Base. No further minting.
/// @dev Use a multisig as `receiver`. Includes EIP-2612 permit for fewer on-chain steps.
contract PlatformSettlementToken is ERC20, ERC20Permit {
    error ZeroAddress();

    constructor(string memory name_, string memory symbol_, uint256 initialSupply_, address receiver_) ERC20(name_, symbol_) ERC20Permit(name_) {
        if (receiver_ == address(0)) revert ZeroAddress();
        if (initialSupply_ == 0) revert();
        _mint(receiver_, initialSupply_);
    }
}
