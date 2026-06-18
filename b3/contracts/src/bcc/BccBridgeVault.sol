// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BccBridgeVault
 * @notice Locks canonical Base BCC for cross-chain wBCC mint (1:1).
 */
contract BccBridgeVault is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");

    IERC20 public immutable bcc;
    uint256 public immutable bscChainId;

    uint256 public lockNonce;
    uint256 public totalLocked;
    uint256 public totalUnlocked;

    mapping(uint256 nonce => bool processed) public processedUnlocks;

    struct BurnAttestation {
        address from;
        uint256 amount;
        bool registered;
    }

    mapping(uint256 nonce => BurnAttestation) public burnAttestations;

    event Locked(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 indexed dstChainId,
        uint256 nonce
    );
    event Unlocked(address indexed to, uint256 amount, uint256 indexed srcChainId, uint256 nonce);
    event BurnRegistered(address indexed from, uint256 amount, uint256 indexed srcChainId, uint256 nonce);

    constructor(address bccToken, uint256 bscChainId_, address admin) {
        require(bccToken != address(0), "BccBridgeVault: zero bcc");
        require(admin != address(0), "BccBridgeVault: zero admin");
        bcc = IERC20(bccToken);
        bscChainId = bscChainId_;
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

    /// @notice User locks BCC to mint wBCC on destination chain.
    function lock(address to, uint256 amount, uint256 dstChainId) external whenNotPaused nonReentrant {
        require(to != address(0), "BccBridgeVault: zero to");
        require(amount > 0, "BccBridgeVault: zero amount");
        require(dstChainId == bscChainId, "BccBridgeVault: unsupported dst");

        bcc.safeTransferFrom(msg.sender, address(this), amount);
        totalLocked += amount;

        uint256 nonce = ++lockNonce;
        emit Locked(msg.sender, to, amount, dstChainId, nonce);
    }

    /// @notice Relayer attests wBCC burn on destination before unlock.
    function registerBurn(address from, uint256 amount, uint256 srcChainId, uint256 nonce)
        external
        onlyRole(BRIDGE_ROLE)
    {
        require(from != address(0), "BccBridgeVault: zero from");
        require(amount > 0, "BccBridgeVault: zero amount");
        require(srcChainId == bscChainId, "BccBridgeVault: unsupported src");
        require(!burnAttestations[nonce].registered, "BccBridgeVault: burn replay");

        burnAttestations[nonce] = BurnAttestation({from: from, amount: amount, registered: true});
        emit BurnRegistered(from, amount, srcChainId, nonce);
    }

    /// @notice Bridge relayer releases BCC after wBCC burn on destination.
    function unlock(address to, uint256 amount, uint256 srcChainId, uint256 nonce)
        external
        onlyRole(BRIDGE_ROLE)
        whenNotPaused
        nonReentrant
    {
        require(to != address(0), "BccBridgeVault: zero to");
        require(amount > 0, "BccBridgeVault: zero amount");
        require(srcChainId == bscChainId, "BccBridgeVault: unsupported src");
        require(!processedUnlocks[nonce], "BccBridgeVault: replay");
        require(burnAttestations[nonce].registered, "BccBridgeVault: no burn");
        require(burnAttestations[nonce].from == to, "BccBridgeVault: burn mismatch");
        require(burnAttestations[nonce].amount == amount, "BccBridgeVault: amount mismatch");
        require(bcc.balanceOf(address(this)) >= amount, "BccBridgeVault: insufficient locked");

        processedUnlocks[nonce] = true;
        totalUnlocked += amount;
        bcc.safeTransfer(to, amount);
        emit Unlocked(to, amount, srcChainId, nonce);
    }

    function lockedBalance() external view returns (uint256) {
        return bcc.balanceOf(address(this));
    }
}
