// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

interface IBCDGenesisMint {
    function genesisMint(address to, uint256 amount) external;
}

/// @notice One-time merkle claim for BCD allocation. Fee (native) routed to treasury.
contract BCDGenesisClaim is Ownable, Pausable, ReentrancyGuard {
    IBCDGenesisMint public immutable token;
    address public immutable treasury;

    bytes32 public merkleRoot;
    uint256 public claimFeeWei;
    /// @notice Epoch seconds — 0 = no deadline.
    uint256 public endsAt;

    mapping(address => bool) public claimed;

    event GenesisClaimed(address indexed account, uint256 amount);
    event MerkleRootUpdated(bytes32 indexed root);
    event ClaimFeeUpdated(uint256 wei_);
    event EndsAtUpdated(uint256 endsAt_);

    constructor(
        address initialOwner,
        address token_,
        address treasury_,
        bytes32 merkleRoot_,
        uint256 claimFeeWei_,
        uint256 endsAt_
    ) Ownable(initialOwner) {
        require(token_ != address(0), "token");
        require(treasury_ != address(0), "treasury");
        token = IBCDGenesisMint(token_);
        treasury = treasury_;
        merkleRoot = merkleRoot_;
        claimFeeWei = claimFeeWei_;
        endsAt = endsAt_;
    }

    function setMerkleRoot(bytes32 newRoot) external onlyOwner {
        merkleRoot = newRoot;
        emit MerkleRootUpdated(newRoot);
    }

    function setClaimFeeWei(uint256 v) external onlyOwner {
        claimFeeWei = v;
        emit ClaimFeeUpdated(v);
    }

    function setEndsAt(uint256 t) external onlyOwner {
        endsAt = t;
        emit EndsAtUpdated(t);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /// @param amount Allocation (same value encoded in the merkle leaf with msg.sender).
    /// @param proof Merkle proof for leaf `keccak256(abi.encode(msg.sender, amount))`.
    function claim(uint256 amount, bytes32[] calldata proof) external payable nonReentrant whenNotPaused {
        if (endsAt != 0) {
            require(block.timestamp <= endsAt, "ended");
        }
        require(!claimed[msg.sender], "claimed");
        require(amount > 0, "amount");

        bytes32 leaf = keccak256(abi.encode(msg.sender, amount));
        require(MerkleProof.verifyCalldata(proof, merkleRoot, leaf), "proof");

        claimed[msg.sender] = true;

        if (claimFeeWei > 0) {
            require(msg.value == claimFeeWei, "fee");
            (bool ok,) = payable(treasury).call{value: msg.value}("");
            require(ok, "treasury");
        } else {
            require(msg.value == 0, "no fee");
        }

        token.genesisMint(msg.sender, amount);

        emit GenesisClaimed(msg.sender, amount);
    }
}
