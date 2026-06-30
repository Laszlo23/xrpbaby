// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title ServiceDealEscrow
/// @notice USDC escrow for partner/marketing services. Terms bound via metadataHash;
///         AI oracle proposes payout; council may override during veto window; else auto-settle.
contract ServiceDealEscrow is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant AI_ORACLE_ROLE = keccak256("AI_ORACLE_ROLE");
    bytes32 public constant COUNCIL_ROLE = keccak256("COUNCIL_ROLE");

    uint256 public constant MAX_BPS = 10_000;

    enum State {
        Open,
        Funded,
        EvidenceSubmitted,
        Ruled,
        Overridden,
        Settled,
        Cancelled
    }

    struct Deal {
        address payer;
        address provider;
        uint256 amount;
        bytes32 metadataHash;
        uint256 deliverBy;
        uint256 vetoWindowSeconds;
        bytes32 evidenceHash;
        bytes32 rulingHash;
        uint16 payoutBps;
        uint256 ruledAt;
        State state;
    }

    IERC20 public immutable PAYMENT_TOKEN;
    uint256 public immutable defaultVetoWindowSeconds;
    uint256 public immutable deliverGraceSeconds;

    uint256 public nextDealId = 1;
    mapping(uint256 dealId => Deal) public deals;

    event DealCreated(
        uint256 indexed dealId,
        address indexed payer,
        address indexed provider,
        uint256 amount,
        bytes32 metadataHash,
        uint256 deliverBy,
        uint256 vetoWindowSeconds
    );
    event DealFunded(uint256 indexed dealId, address indexed payer, uint256 amount);
    event EvidenceSubmitted(uint256 indexed dealId, bytes32 indexed evidenceHash, address indexed provider);
    event RulingProposed(uint256 indexed dealId, uint16 payoutBps, bytes32 indexed rulingHash, uint256 ruledAt);
    event RulingOverridden(uint256 indexed dealId, uint16 payoutBps, bytes32 indexed rulingHash);
    event DealSettled(
        uint256 indexed dealId,
        uint16 payoutBps,
        uint256 providerAmount,
        uint256 payerRefund,
        address indexed provider,
        address indexed payer
    );
    event DealCancelled(uint256 indexed dealId, address indexed payer, uint256 refundAmount);

    error BadState();
    error NotParty();
    error WrongAmount();
    error BadDeadline();
    error BadAddress();
    error BadBps();
    error BadHash();
    error VetoWindowActive();
    error VetoWindowExpired();
    error TooEarlyToSettle();
    error TooEarlyToRefund();

    constructor(
        address paymentToken_,
        address admin,
        address aiOracle,
        address council,
        uint256 defaultVetoWindowSeconds_,
        uint256 deliverGraceSeconds_
    ) {
        if (paymentToken_ == address(0) || admin == address(0)) revert BadAddress();
        if (defaultVetoWindowSeconds_ == 0 || deliverGraceSeconds_ == 0) revert BadDeadline();

        PAYMENT_TOKEN = IERC20(paymentToken_);
        defaultVetoWindowSeconds = defaultVetoWindowSeconds_;
        deliverGraceSeconds = deliverGraceSeconds_;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        if (aiOracle != address(0)) _grantRole(AI_ORACLE_ROLE, aiOracle);
        if (council != address(0)) _grantRole(COUNCIL_ROLE, council);
    }

    /// @param vetoWindowSeconds 0 uses contract default.
    function createDeal(
        address provider,
        uint256 amount,
        bytes32 metadataHash,
        uint256 deliverBy,
        uint256 vetoWindowSeconds
    ) external returns (uint256 dealId) {
        if (provider == address(0) || provider == msg.sender) revert BadAddress();
        if (amount == 0) revert WrongAmount();
        if (metadataHash == bytes32(0)) revert BadHash();
        if (deliverBy <= block.timestamp) revert BadDeadline();

        uint256 window = vetoWindowSeconds == 0 ? defaultVetoWindowSeconds : vetoWindowSeconds;

        dealId = nextDealId++;
        deals[dealId] = Deal({
            payer: msg.sender,
            provider: provider,
            amount: amount,
            metadataHash: metadataHash,
            deliverBy: deliverBy,
            vetoWindowSeconds: window,
            evidenceHash: bytes32(0),
            rulingHash: bytes32(0),
            payoutBps: 0,
            ruledAt: 0,
            state: State.Open
        });

        emit DealCreated(dealId, msg.sender, provider, amount, metadataHash, deliverBy, window);
    }

    function fund(uint256 dealId) external nonReentrant {
        Deal storage d = deals[dealId];
        if (d.state != State.Open) revert BadState();
        if (msg.sender != d.payer) revert NotParty();

        d.state = State.Funded;
        PAYMENT_TOKEN.safeTransferFrom(d.payer, address(this), d.amount);

        emit DealFunded(dealId, d.payer, d.amount);
    }

    function submitEvidence(uint256 dealId, bytes32 evidenceHash) external {
        Deal storage d = deals[dealId];
        if (d.state != State.Funded) revert BadState();
        if (msg.sender != d.provider) revert NotParty();
        if (block.timestamp > d.deliverBy) revert BadDeadline();
        if (evidenceHash == bytes32(0)) revert BadHash();

        d.evidenceHash = evidenceHash;
        d.state = State.EvidenceSubmitted;

        emit EvidenceSubmitted(dealId, evidenceHash, d.provider);
    }

    function proposeRuling(uint256 dealId, uint16 payoutBps, bytes32 rulingHash) external onlyRole(AI_ORACLE_ROLE) {
        Deal storage d = deals[dealId];
        if (d.state != State.EvidenceSubmitted) revert BadState();
        if (payoutBps > MAX_BPS) revert BadBps();
        if (rulingHash == bytes32(0)) revert BadHash();

        d.payoutBps = payoutBps;
        d.rulingHash = rulingHash;
        d.ruledAt = block.timestamp;
        d.state = State.Ruled;

        emit RulingProposed(dealId, payoutBps, rulingHash, d.ruledAt);
    }

    function overrideRuling(uint256 dealId, uint16 payoutBps, bytes32 rulingHash) external onlyRole(COUNCIL_ROLE) {
        Deal storage d = deals[dealId];
        if (d.state != State.Ruled && d.state != State.Overridden) revert BadState();
        if (payoutBps > MAX_BPS) revert BadBps();
        if (rulingHash == bytes32(0)) revert BadHash();
        if (block.timestamp > d.ruledAt + d.vetoWindowSeconds) revert VetoWindowExpired();

        d.payoutBps = payoutBps;
        d.rulingHash = rulingHash;
        d.state = State.Overridden;

        emit RulingOverridden(dealId, payoutBps, rulingHash);
    }

    function settle(uint256 dealId) external nonReentrant {
        Deal storage d = deals[dealId];
        if (d.state != State.Ruled && d.state != State.Overridden) revert BadState();
        if (block.timestamp < d.ruledAt + d.vetoWindowSeconds) revert TooEarlyToSettle();

        d.state = State.Settled;
        _distribute(dealId, d);
    }

    function refundIfExpired(uint256 dealId) external nonReentrant {
        Deal storage d = deals[dealId];
        if (d.state != State.Funded) revert BadState();
        if (d.evidenceHash != bytes32(0)) revert BadState();
        if (block.timestamp <= d.deliverBy + deliverGraceSeconds) revert TooEarlyToRefund();

        d.state = State.Cancelled;
        uint256 amount = d.amount;
        PAYMENT_TOKEN.safeTransfer(d.payer, amount);

        emit DealCancelled(dealId, d.payer, amount);
    }

    function cancelOpen(uint256 dealId) external {
        Deal storage d = deals[dealId];
        if (d.state != State.Open) revert BadState();
        if (msg.sender != d.payer) revert NotParty();

        d.state = State.Cancelled;
        emit DealCancelled(dealId, d.payer, 0);
    }

    function _distribute(uint256 dealId, Deal storage d) internal {
        uint256 providerAmount = (d.amount * uint256(d.payoutBps)) / MAX_BPS;
        uint256 payerRefund = d.amount - providerAmount;

        if (providerAmount > 0) {
            PAYMENT_TOKEN.safeTransfer(d.provider, providerAmount);
        }
        if (payerRefund > 0) {
            PAYMENT_TOKEN.safeTransfer(d.payer, payerRefund);
        }

        emit DealSettled(dealId, d.payoutBps, providerAmount, payerRefund, d.provider, d.payer);
    }
}
