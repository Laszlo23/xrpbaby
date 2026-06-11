// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BccOFT
 * @notice BSC peer for canonical Base BCC — mint/burn only via trusted bridge (LayerZero OApp).
 * @dev Deploy on BSC (56). Wire `bridge` to LayerZero OFT endpoint after deploy.
 */
contract BccOFT is ERC20, Ownable {
    address public bridge;

    event BridgeUpdated(address indexed previousBridge, address indexed newBridge);

    modifier onlyBridge() {
        require(msg.sender == bridge, "BccOFT: not bridge");
        _;
    }

    constructor(address owner_) ERC20("Building Culture Capital", "BCC") Ownable(owner_) {}

    function setBridge(address bridge_) external onlyOwner {
        emit BridgeUpdated(bridge, bridge_);
        bridge = bridge_;
    }

    /// @notice Mint bridged BCC when canonical tokens lock on Base.
    function bridgeMint(address to, uint256 amount) external onlyBridge {
        _mint(to, amount);
    }

    /// @notice Burn BCC when bridging back to Base.
    function bridgeBurn(address from, uint256 amount) external onlyBridge {
        _burn(from, amount);
    }
}
