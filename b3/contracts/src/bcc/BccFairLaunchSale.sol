// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title BccFairLaunchSale
/// @notice Fixed-price wBCC sale on BSC — BNB or ERC20 payment to treasury. No inflation (pre-funded inventory).
contract BccFairLaunchSale is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable wBcc;
    address public immutable treasury;

    uint256 public feeBps;

    struct Round {
        uint64 start;
        uint64 end;
        bytes32 merkleRoot;
        address paymentToken;
        uint256 paymentPerWholeWbcc;
        uint256 maxWbccWei;
        uint256 perWalletCapWei;
    }

    mapping(uint256 roundId => Round) public rounds;
    mapping(uint256 roundId => uint256 soldWbccWei) public roundSoldWbccWei;
    mapping(uint256 roundId => mapping(address buyer => uint256 boughtWbccWei)) public walletBoughtWbccWei;

    event RoundConfigured(uint256 indexed roundId, uint64 start, uint64 end, address paymentToken, uint256 maxWbccWei);
    event Purchased(uint256 indexed roundId, address indexed buyer, uint256 wbccWei, uint256 paymentToTreasury);
    event FeeBpsUpdated(uint256 feeBps);
    event InventoryDeposited(address indexed from, uint256 amount);

    constructor(address initialOwner, address wbcc_, address treasury_) Ownable(initialOwner) {
        require(wbcc_ != address(0) && treasury_ != address(0), "zero addr");
        wBcc = IERC20(wbcc_);
        treasury = treasury_;
    }

    function depositInventory(uint256 amount) external {
        wBcc.safeTransferFrom(msg.sender, address(this), amount);
        emit InventoryDeposited(msg.sender, amount);
    }

    function setFeeBps(uint256 bps) external onlyOwner {
        require(bps <= 2_000, "fee cap");
        feeBps = bps;
        emit FeeBpsUpdated(bps);
    }

    function configureRound(uint256 roundId, Round calldata r) external onlyOwner {
        require(r.end >= r.start, "time");
        require(r.maxWbccWei > 0 && r.paymentPerWholeWbcc > 0, "params");
        rounds[roundId] = r;
        emit RoundConfigured(roundId, r.start, r.end, r.paymentToken, r.maxWbccWei);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function buy(uint256 roundId, uint256 wbccAmountWei, uint256 merkleMaxWbccWei, bytes32[] calldata proof)
        external
        payable
        nonReentrant
        whenNotPaused
    {
        Round memory r = rounds[roundId];
        require(r.maxWbccWei > 0, "no round");
        require(block.timestamp >= r.start && block.timestamp <= r.end, "inactive");
        require(wbccAmountWei > 0, "amount");
        require(wBcc.balanceOf(address(this)) >= wbccAmountWei, "inventory");

        if (r.merkleRoot != bytes32(0)) {
            bytes32 leaf = keccak256(abi.encode(roundId, msg.sender, merkleMaxWbccWei));
            require(MerkleProof.verifyCalldata(proof, r.merkleRoot, leaf), "proof");
            require(walletBoughtWbccWei[roundId][msg.sender] + wbccAmountWei <= merkleMaxWbccWei, "alloc");
        } else if (r.perWalletCapWei > 0) {
            require(walletBoughtWbccWei[roundId][msg.sender] + wbccAmountWei <= r.perWalletCapWei, "wallet cap");
        }

        require(roundSoldWbccWei[roundId] + wbccAmountWei <= r.maxWbccWei, "sold out");

        uint256 basePayment = Math.mulDiv(wbccAmountWei, r.paymentPerWholeWbcc, 1 ether, Math.Rounding.Ceil);
        uint256 feePayment = Math.mulDiv(basePayment, feeBps, 10_000, Math.Rounding.Ceil);
        uint256 totalPayment = basePayment + feePayment;

        if (r.paymentToken == address(0)) {
            require(msg.value >= totalPayment, "bnb");
            (bool ok,) = payable(treasury).call{value: totalPayment}("");
            require(ok, "treasury");
            if (msg.value > totalPayment) {
                (bool okR,) = payable(msg.sender).call{value: msg.value - totalPayment}("");
                require(okR, "refund");
            }
        } else {
            require(msg.value == 0, "no bnb");
            IERC20(r.paymentToken).safeTransferFrom(msg.sender, treasury, totalPayment);
        }

        roundSoldWbccWei[roundId] += wbccAmountWei;
        walletBoughtWbccWei[roundId][msg.sender] += wbccAmountWei;
        wBcc.safeTransfer(msg.sender, wbccAmountWei);

        emit Purchased(roundId, msg.sender, wbccAmountWei, totalPayment);
    }

    receive() external payable {}
}
