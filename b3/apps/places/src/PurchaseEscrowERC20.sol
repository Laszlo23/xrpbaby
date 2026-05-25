// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IPropertyRegistry {
    function propertyExists(uint256 propertyId) external view returns (bool);
}

/// @title PurchaseEscrowERC20
/// @notice Escrow for a simple purchase: buyer funds with `paymentToken` before `fundBefore`;
///         seller releases before `releaseBefore`, otherwise buyer can reclaim after `releaseBefore`.
contract PurchaseEscrowERC20 is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum State {
        Open,
        Funded,
        Completed,
        Cancelled
    }

    struct Escrow {
        uint256 propertyId;
        address seller;
        address buyer;
        uint256 price;
        uint256 fundBefore;
        uint256 releaseWindowSeconds;
        uint256 releaseBefore;
        State state;
    }

    IERC20 public immutable PAYMENT_TOKEN;
    IPropertyRegistry public immutable REGISTRY;
    uint256 public nextEscrowId = 1;
    mapping(uint256 escrowId => Escrow) public escrows;

    event EscrowOpened(
        uint256 indexed escrowId,
        uint256 indexed propertyId,
        address indexed seller,
        address buyer,
        uint256 price,
        uint256 fundBefore,
        uint256 releaseWindowSeconds
    );
    event EscrowFunded(uint256 indexed escrowId, uint256 indexed propertyId, uint256 releaseBefore);
    event EscrowReleased(uint256 indexed escrowId, uint256 indexed propertyId, uint256 amount, address indexed seller);
    event EscrowCancelled(uint256 indexed escrowId);
    event EscrowRefunded(uint256 indexed escrowId, uint256 indexed propertyId, uint256 amount, address indexed buyer);

    error BadState();
    error NotParty();
    error WrongAmount();
    error TooLateToFund();
    error RegistryMismatch();
    error BadDeadline();
    error NotSeller();

    constructor(address propertyRegistry, address paymentToken_) {
        REGISTRY = IPropertyRegistry(propertyRegistry);
        PAYMENT_TOKEN = IERC20(paymentToken_);
    }

    /// @param fundBefore Buyer must call `fund` by this timestamp.
    /// @param releaseWindowSeconds After funding, `releaseBefore` = block.timestamp + this value.
    function openEscrow(
        uint256 propertyId,
        address buyer,
        uint256 price,
        uint256 fundBefore,
        uint256 releaseWindowSeconds
    ) external returns (uint256 escrowId) {
        if (!REGISTRY.propertyExists(propertyId)) revert RegistryMismatch();
        if (buyer == address(0) || buyer == msg.sender) revert NotParty();
        if (price == 0) revert WrongAmount();
        if (fundBefore <= block.timestamp) revert BadDeadline();
        if (releaseWindowSeconds == 0) revert BadDeadline();

        escrowId = nextEscrowId++;
        escrows[escrowId] = Escrow({
            propertyId: propertyId,
            seller: msg.sender,
            buyer: buyer,
            price: price,
            fundBefore: fundBefore,
            releaseWindowSeconds: releaseWindowSeconds,
            releaseBefore: 0,
            state: State.Open
        });

        emit EscrowOpened(escrowId, propertyId, msg.sender, buyer, price, fundBefore, releaseWindowSeconds);
    }

    function fund(uint256 escrowId) external nonReentrant {
        Escrow storage e = escrows[escrowId];
        if (e.state != State.Open) revert BadState();
        if (block.timestamp > e.fundBefore) revert TooLateToFund();
        if (msg.sender != e.buyer) revert NotParty();

        e.state = State.Funded;
        e.releaseBefore = block.timestamp + e.releaseWindowSeconds;

        PAYMENT_TOKEN.safeTransferFrom(msg.sender, address(this), e.price);

        emit EscrowFunded(escrowId, e.propertyId, e.releaseBefore);
    }

    function release(uint256 escrowId) external nonReentrant {
        Escrow storage e = escrows[escrowId];
        if (e.state != State.Funded) revert BadState();
        if (msg.sender != e.seller) revert NotSeller();
        if (block.timestamp > e.releaseBefore) revert BadState();

        e.state = State.Completed;
        uint256 amount = e.price;
        PAYMENT_TOKEN.safeTransfer(e.seller, amount);

        emit EscrowReleased(escrowId, e.propertyId, amount, e.seller);
    }

    function refundBuyer(uint256 escrowId) external nonReentrant {
        Escrow storage e = escrows[escrowId];
        if (e.state != State.Funded) revert BadState();
        if (block.timestamp <= e.releaseBefore) revert BadState();
        if (msg.sender != e.buyer) revert NotParty();

        e.state = State.Cancelled;
        uint256 amount = e.price;
        PAYMENT_TOKEN.safeTransfer(e.buyer, amount);

        emit EscrowRefunded(escrowId, e.propertyId, amount, e.buyer);
    }

    function cancelOpen(uint256 escrowId) external {
        Escrow storage e = escrows[escrowId];
        if (e.state != State.Open) revert BadState();
        if (msg.sender != e.seller) revert NotSeller();

        e.state = State.Cancelled;
        emit EscrowCancelled(escrowId);
    }

    function expireOpen(uint256 escrowId) external {
        Escrow storage e = escrows[escrowId];
        if (e.state != State.Open) revert BadState();
        if (block.timestamp <= e.fundBefore) revert BadDeadline();
        if (msg.sender != e.seller) revert NotSeller();

        e.state = State.Cancelled;
        emit EscrowCancelled(escrowId);
    }
}
