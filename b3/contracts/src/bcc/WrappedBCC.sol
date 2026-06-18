// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title WrappedBCC
 * @notice BNB Chain (and future EVM) wrapped representation of canonical Base BCC.
 * @dev Mint/burn only via trusted bridge relayer. 1 wBCC exists only when 1 BCC is locked on Base.
 */
contract WrappedBCC is ERC20, ERC20Burnable, AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");

    /// @notice Canonical BCC on Base (metadata; not enforced on-chain cross-chain).
    address public immutable canonicalBcc;

    uint256 public totalMinted;
    uint256 public totalBurned;

    event BridgeMinted(address indexed to, uint256 amount, uint256 nonce);
    event BridgeBurned(address indexed from, uint256 amount, uint256 dstChainId, uint256 nonce);

    constructor(address canonicalBcc_, address admin) ERC20("Wrapped Building Culture Capital", "wBCC") {
        require(canonicalBcc_ != address(0), "WrappedBCC: zero canonical");
        require(admin != address(0), "WrappedBCC: zero admin");
        canonicalBcc = canonicalBcc_;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function setBridge(address bridge) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(BRIDGE_ROLE, bridge);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /// @notice Mint wBCC when canonical BCC locks on Base.
    function bridgeMint(address to, uint256 amount, uint256 nonce) external onlyRole(BRIDGE_ROLE) whenNotPaused nonReentrant {
        require(to != address(0), "WrappedBCC: zero to");
        require(amount > 0, "WrappedBCC: zero amount");
        totalMinted += amount;
        _mint(to, amount);
        emit BridgeMinted(to, amount, nonce);
    }

    /// @notice User-initiated burn when bridging back to Base.
    function bridgeBurn(uint256 amount, uint256 dstChainId) external whenNotPaused nonReentrant returns (uint256 nonce) {
        require(amount > 0, "WrappedBCC: zero amount");
        _burn(msg.sender, amount);
        totalBurned += amount;
        nonce = totalBurned;
        emit BridgeBurned(msg.sender, amount, dstChainId, nonce);
    }
}
