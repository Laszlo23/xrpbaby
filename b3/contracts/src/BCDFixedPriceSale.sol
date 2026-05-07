// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IBCDSaleMintable {
    function saleMint(address to, uint256 amount) external;
}

/// @title BCDFixedPriceSale
/// @notice Fixed-price BCD purchase rounds: private (merkle max allocation) or public (`merkleRoot == 0`).
/// @dev Assumes BCD uses 18 decimals. `paymentPerWholeBcd` is payment smallest units per 1e18 wei of BCD.
///      If `paymentToken` is zero address, buyers pay native ETH. Otherwise ERC20 `transferFrom` from buyer to treasury.
contract BCDFixedPriceSale is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IBCDSaleMintable public immutable token;
    address public immutable treasury;
    IERC20 public immutable paymentToken;

    /// @notice Extra bps added on top of base payment (buyer pays `base + base*feeBps/10_000`).
    uint256 public feeBps;

    struct Round {
        uint64 start;
        uint64 end;
        /// @dev If zero, round is public (no merkle). Otherwise leaf is `keccak256(abi.encode(roundId, account, maxBcdWei))`.
        bytes32 merkleRoot;
        /// @dev Payment smallest units per 1e18 BCD wei (per whole token if 18 decimals).
        uint256 paymentPerWholeBcd;
        /// @dev Max total BCD wei sellable in this round.
        uint256 maxBcdWei;
        /// @dev For **public** rounds only: wallet cap per address (in BCD wei). Zero = unlimited per wallet subject to round cap.
        uint256 perWalletPublicCapWei;
    }

    mapping(uint256 roundId => Round) public rounds;
    mapping(uint256 roundId => uint256 soldBcdWei) public roundSoldBcdWei;
    mapping(uint256 roundId => mapping(address buyer => uint256 boughtBcdWei)) public walletBoughtBcdWei;

    event RoundConfigured(
        uint256 indexed roundId, uint64 start, uint64 end, bytes32 merkleRoot, uint256 paymentPerWholeBcd, uint256 maxBcdWei
    );
    event Purchased(uint256 indexed roundId, address indexed buyer, uint256 bcdWei, uint256 paymentToTreasury);
    event FeeBpsUpdated(uint256 feeBps);

    constructor(address initialOwner, address token_, address treasury_, address paymentToken_) Ownable(initialOwner) {
        require(token_ != address(0) && treasury_ != address(0), "zero addr");
        token = IBCDSaleMintable(token_);
        treasury = treasury_;
        paymentToken = IERC20(paymentToken_);
    }

    function setFeeBps(uint256 bps) external onlyOwner {
        require(bps <= 2_000, "fee cap");
        feeBps = bps;
        emit FeeBpsUpdated(bps);
    }

    function configureRound(uint256 roundId, Round calldata r) external onlyOwner {
        require(r.end >= r.start, "time");
        require(r.maxBcdWei > 0 && r.paymentPerWholeBcd > 0, "params");
        rounds[roundId] = r;
        emit RoundConfigured(roundId, r.start, r.end, r.merkleRoot, r.paymentPerWholeBcd, r.maxBcdWei);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /// @param merkleMaxBcdWei Max allocation from merkle leaf; ignored for public rounds (pass 0).
    function buy(uint256 roundId, uint256 bcdAmountWei, uint256 merkleMaxBcdWei, bytes32[] calldata proof)
        external
        payable
        nonReentrant
        whenNotPaused
    {
        Round memory r = rounds[roundId];
        require(r.maxBcdWei > 0, "no round");
        require(block.timestamp >= r.start && block.timestamp <= r.end, "inactive");
        require(bcdAmountWei > 0, "amount");

        if (r.merkleRoot != bytes32(0)) {
            bytes32 leaf = keccak256(abi.encode(roundId, msg.sender, merkleMaxBcdWei));
            require(MerkleProof.verifyCalldata(proof, r.merkleRoot, leaf), "proof");
            require(walletBoughtBcdWei[roundId][msg.sender] + bcdAmountWei <= merkleMaxBcdWei, "alloc");
        } else {
            if (r.perWalletPublicCapWei > 0) {
                require(walletBoughtBcdWei[roundId][msg.sender] + bcdAmountWei <= r.perWalletPublicCapWei, "wallet cap");
            }
        }

        require(roundSoldBcdWei[roundId] + bcdAmountWei <= r.maxBcdWei, "sold out");

        uint256 basePayment =
            Math.mulDiv(bcdAmountWei, r.paymentPerWholeBcd, 1 ether, Math.Rounding.Ceil);
        uint256 feePayment = Math.mulDiv(basePayment, feeBps, 10_000, Math.Rounding.Ceil);
        uint256 totalPayment = basePayment + feePayment;

        if (address(paymentToken) == address(0)) {
            require(msg.value >= totalPayment, "eth");
            (bool ok,) = payable(treasury).call{value: totalPayment}("");
            require(ok, "treasury");
            if (msg.value > totalPayment) {
                (bool okR,) = payable(msg.sender).call{value: msg.value - totalPayment}("");
                require(okR, "refund");
            }
        } else {
            require(msg.value == 0, "no eth");
            paymentToken.safeTransferFrom(msg.sender, treasury, totalPayment);
        }

        roundSoldBcdWei[roundId] += bcdAmountWei;
        walletBoughtBcdWei[roundId][msg.sender] += bcdAmountWei;

        token.saleMint(msg.sender, bcdAmountWei);

        emit Purchased(roundId, msg.sender, bcdAmountWei, totalPayment);
    }

    receive() external payable {}

    function rescueETH() external onlyOwner {
        uint256 b = address(this).balance;
        require(b > 0, "none");
        (bool ok,) = payable(treasury).call{value: b}("");
        require(ok, "send");
    }

    function rescueERC20(address a) external onlyOwner {
        require(a != address(paymentToken), "payment");
        IERC20 t = IERC20(a);
        t.safeTransfer(treasury, t.balanceOf(address(this)));
    }
}
