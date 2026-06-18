// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title CulturePassBccRewards
/// @notice Merkle claim of BCC allocation for Culture Pass holders — treasury-funded, no mint.
contract CulturePassBccRewards is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable bcc;
    address public immutable treasury;

    bytes32 public merkleRoot;
    uint256 public claimEndsAt;

    mapping(address => bool) public claimed;

    event Claimed(address indexed account, uint256 amount);
    event MerkleRootUpdated(bytes32 root);
    event ClaimEndsAtUpdated(uint256 endsAt);
    event Funded(address indexed from, uint256 amount);

    constructor(address initialOwner, address bcc_, address treasury_) Ownable(initialOwner) {
        require(bcc_ != address(0) && treasury_ != address(0), "zero addr");
        bcc = IERC20(bcc_);
        treasury = treasury_;
    }

    function setMerkleRoot(bytes32 root) external onlyOwner {
        merkleRoot = root;
        emit MerkleRootUpdated(root);
    }

    function setClaimEndsAt(uint256 t) external onlyOwner {
        claimEndsAt = t;
        emit ClaimEndsAtUpdated(t);
    }

    function fundFromTreasury(uint256 amount) external {
        bcc.safeTransferFrom(msg.sender, address(this), amount);
        emit Funded(msg.sender, amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function claim(uint256 amount, bytes32[] calldata proof) external nonReentrant whenNotPaused {
        require(merkleRoot != bytes32(0), "no root");
        require(!claimed[msg.sender], "claimed");
        if (claimEndsAt > 0) require(block.timestamp <= claimEndsAt, "ended");

        bytes32 leaf = keccak256(abi.encode(msg.sender, amount));
        require(MerkleProof.verifyCalldata(proof, merkleRoot, leaf), "proof");
        require(bcc.balanceOf(address(this)) >= amount, "balance");

        claimed[msg.sender] = true;
        bcc.safeTransfer(msg.sender, amount);
        emit Claimed(msg.sender, amount);
    }
}
