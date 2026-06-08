// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {BuildingCultureTicket} from "./BuildingCultureTicket.sol";

/// @title Building Culture raffle hub on Base
/// @notice Manages artwork editions, ETH ticket sales, and winner draws.
/// @dev Production should upgrade winner selection to Chainlink VRF — see `RaffleTicketCampaignVrf.sol` in b3/contracts.
contract BuildingCultureHub is Ownable, ReentrancyGuard {
    BuildingCultureTicket public immutable ticket;

    struct Edition {
        string slug;
        uint96 ticketPriceWei;
        uint32 maxSupply;
        uint32 sold;
        address artist;
        bool active;
        bool drawn;
        address winner;
        uint256 winningTokenId;
    }

    Edition[] public editions;
    mapping(uint256 editionId => address[] participants) private _participants;

    event EditionCreated(uint256 indexed editionId, string slug, uint96 ticketPriceWei, uint32 maxSupply, address artist);
    event TicketsMinted(uint256 indexed editionId, address indexed buyer, uint256 quantity, uint256 firstTokenId);
    event WinnerDrawn(uint256 indexed editionId, address indexed winner, uint256 winningTokenId);
    event Withdrawn(address indexed to, uint256 amount);

    error InvalidEdition();
    error EditionInactive();
    error EditionSoldOut();
    error InvalidQuantity();
    error InsufficientPayment();
    error NotReadyToDraw();
    error AlreadyDrawn();
    error TransferFailed();

    constructor(address ticketContract, address initialOwner) Ownable(initialOwner) {
        ticket = BuildingCultureTicket(ticketContract);
    }

    function editionCount() external view returns (uint256) {
        return editions.length;
    }

    function getEdition(uint256 editionId)
        external
        view
        returns (
            string memory slug,
            uint96 ticketPriceWei,
            uint32 maxSupply,
            uint32 sold,
            address artist,
            bool active,
            bool drawn,
            address winner,
            uint256 winningTokenId
        )
    {
        Edition storage e = _edition(editionId);
        return (e.slug, e.ticketPriceWei, e.maxSupply, e.sold, e.artist, e.active, e.drawn, e.winner, e.winningTokenId);
    }

    function participantCount(uint256 editionId) external view returns (uint256) {
        return _participants[editionId].length;
    }

    function createEdition(
        string calldata slug,
        uint96 ticketPriceWei,
        uint32 maxSupply,
        address artist
    ) external onlyOwner returns (uint256 editionId) {
        editionId = editions.length;
        editions.push(
            Edition({
                slug: slug,
                ticketPriceWei: ticketPriceWei,
                maxSupply: maxSupply,
                sold: 0,
                artist: artist,
                active: true,
                drawn: false,
                winner: address(0),
                winningTokenId: 0
            })
        );
        emit EditionCreated(editionId, slug, ticketPriceWei, maxSupply, artist);
    }

    function setEditionActive(uint256 editionId, bool active) external onlyOwner {
        Edition storage e = _edition(editionId);
        e.active = active;
    }

    function mintTickets(uint256 editionId, uint256 quantity) external payable nonReentrant {
        if (quantity == 0) revert InvalidQuantity();

        Edition storage e = _edition(editionId);
        if (!e.active) revert EditionInactive();
        if (e.drawn) revert AlreadyDrawn();
        if (e.sold + quantity > e.maxSupply) revert EditionSoldOut();

        uint256 cost = uint256(e.ticketPriceWei) * quantity;
        if (msg.value < cost) revert InsufficientPayment();

        uint256 firstTokenId = ticket.totalMinted();
        for (uint256 i = 0; i < quantity; ) {
            ticket.mint(msg.sender, editionId);
            _participants[editionId].push(msg.sender);
            unchecked {
                ++i;
                ++e.sold;
            }
        }

        emit TicketsMinted(editionId, msg.sender, quantity, firstTokenId);

        if (msg.value > cost) {
            (bool refunded,) = msg.sender.call{value: msg.value - cost}("");
            if (!refunded) revert TransferFailed();
        }
    }

    /// @notice Draw winner when edition is sold out. Uses block entropy — replace with VRF for mainnet production.
    function drawWinner(uint256 editionId) external nonReentrant {
        Edition storage e = _edition(editionId);
        if (e.drawn) revert AlreadyDrawn();
        if (e.sold != e.maxSupply) revert NotReadyToDraw();

        address[] storage pool = _participants[editionId];
        uint256 winningIndex = uint256(
            keccak256(abi.encodePacked(block.prevrandao, block.timestamp, editionId, pool.length, msg.sender))
        ) % pool.length;

        address winner = pool[winningIndex];
        uint256 winningTokenId = _findTokenForParticipant(editionId, winner, winningIndex);

        e.drawn = true;
        e.winner = winner;
        e.winningTokenId = winningTokenId;

        emit WinnerDrawn(editionId, winner, winningTokenId);
    }

    function withdraw(address payable to, uint256 amount) external onlyOwner nonReentrant {
        (bool ok,) = to.call{value: amount}("");
        if (!ok) revert TransferFailed();
        emit Withdrawn(to, amount);
    }

    function _edition(uint256 editionId) private view returns (Edition storage e) {
        if (editionId >= editions.length) revert InvalidEdition();
        e = editions[editionId];
    }

    /// @dev Finds the nth ticket owned by participant in edition (winningIndex-th occurrence).
    function _findTokenForParticipant(uint256 editionId, address participant, uint256 winningIndex)
        private
        view
        returns (uint256)
    {
        uint256 total = ticket.totalMinted();
        uint256 seen;
        for (uint256 tokenId = 0; tokenId < total; ) {
            if (ticket.tokenEdition(tokenId) == editionId) {
                try ticket.ownerOf(tokenId) returns (address owner) {
                    if (owner == participant) {
                        if (seen == winningIndex) return tokenId;
                        unchecked {
                            ++seen;
                        }
                    }
                } catch {}
            }
            unchecked {
                ++tokenId;
            }
        }
        return winningIndex;
    }
}
