// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IPropertyRegistry {
    function propertyExists(uint256 propertyId) external view returns (bool);
}

/// @title PurchaseEscrow
/// @notice Holds native 0G chain currency for a simple purchase: buyer funds by `fundBefore`,
///         seller releases before `releaseBefore`, otherwise buyer can reclaim after `releaseBefore`.
contract PurchaseEscrow is ReentrancyGuard {
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

    constructor(address propertyRegistry) {
        REGISTRY = IPropertyRegistry(propertyRegistry);
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

    function fund(uint256 escrowId) external payable nonReentrant {
        Escrow storage e = escrows[escrowId];
        if (e.state != State.Open) revert BadState();
        if (block.timestamp > e.fundBefore) revert TooLateToFund();
        if (msg.sender != e.buyer) revert NotParty();
        if (msg.value != e.price) revert WrongAmount();

        e.state = State.Funded;
        e.releaseBefore = block.timestamp + e.releaseWindowSeconds;

        emit EscrowFunded(escrowId, e.propertyId, e.releaseBefore);
    }

    function release(uint256 escrowId) external nonReentrant {
        Escrow storage e = escrows[escrowId];
        if (e.state != State.Funded) revert BadState();
        if (msg.sender != e.seller) revert NotSeller();
        if (block.timestamp > e.releaseBefore) revert BadState();

        e.state = State.Completed;
        uint256 amount = e.price;
        (bool ok,) = payable(e.seller).call{value: amount}("");
        require(ok, "transfer failed");

        emit EscrowReleased(escrowId, e.propertyId, amount, e.seller);
    }

    function refundBuyer(uint256 escrowId) external nonReentrant {
        Escrow storage e = escrows[escrowId];
        if (e.state != State.Funded) revert BadState();
        if (block.timestamp <= e.releaseBefore) revert BadState();
        if (msg.sender != e.buyer) revert NotParty();

        e.state = State.Cancelled;
        uint256 amount = e.price;
        require(address(this).balance >= amount, "insufficient balance");
        (bool ok,) = payable(e.buyer).call{value: amount}("");
        require(ok, "transfer failed");

        emit EscrowRefunded(escrowId, e.propertyId, amount, e.buyer);
    }

    function cancelOpen(uint256 escrowId) external {
        Escrow storage e = escrows[escrowId];
        if (e.state != State.Open) revert BadState();
        if (msg.sender != e.seller) revert NotSeller();

        e.state = State.Cancelled;
        emit EscrowCancelled(escrowId);
    }

    /// @notice If buyer never funded before `fundBefore`, seller clears the stale listing.
    function expireOpen(uint256 escrowId) external {
        Escrow storage e = escrows[escrowId];
        if (e.state != State.Open) revert BadState();
        if (block.timestamp <= e.fundBefore) revert BadDeadline();
        if (msg.sender != e.seller) revert NotSeller();

        e.state = State.Cancelled;
        emit EscrowCancelled(escrowId);
    }
}
