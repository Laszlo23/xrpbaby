// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BccOFTAdapter
 * @notice Locks canonical Base BCC for cross-chain transfer to BSC peer (1:1).
 * @dev Production: replace `bridge` with LayerZero OFT Adapter OApp. Deploy on Base (8453).
 */
contract BccOFTAdapter is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable bcc;
    address public bridge;

    event Locked(address indexed from, bytes32 indexed to, uint256 amount);
    event Unlocked(address indexed to, uint256 amount);
    event BridgeUpdated(address indexed previousBridge, address indexed newBridge);

    modifier onlyBridge() {
        require(msg.sender == bridge, "BccOFTAdapter: not bridge");
        _;
    }

    constructor(address bccToken, address owner_) Ownable(owner_) {
        require(bccToken != address(0), "BccOFTAdapter: zero bcc");
        bcc = IERC20(bccToken);
    }

    function setBridge(address bridge_) external onlyOwner {
        emit BridgeUpdated(bridge, bridge_);
        bridge = bridge_;
    }

    /// @notice User-initiated lock — bridge relayer mints on BSC.
    function lock(bytes32 to, uint256 amount) external {
        require(amount > 0, "BccOFTAdapter: zero amount");
        bcc.safeTransferFrom(msg.sender, address(this), amount);
        emit Locked(msg.sender, to, amount);
    }

    /// @notice Bridge unlocks canonical BCC when BSC peer burns.
    function unlock(address to, uint256 amount) external onlyBridge {
        require(to != address(0), "BccOFTAdapter: zero to");
        bcc.safeTransfer(to, amount);
        emit Unlocked(to, amount);
    }

    function lockedBalance() external view returns (uint256) {
        return bcc.balanceOf(address(this));
    }
}
