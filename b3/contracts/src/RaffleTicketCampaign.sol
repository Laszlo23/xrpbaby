// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// Raffle MVP settles in native ETH. Product roadmap includes an optional raffle variant charging an ERC‑20 (`paymentToken`)
/// plus `approve`/`transferFrom` flows so BCD can settle tickets without breaking this deployment.

import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title RaffleTicketCampaign
/// @notice Fixed-price ERC721 tickets with treasury payout. Winner uses commit–reveal **plus**
/// a future `blockhash(entropyBlock)` so the owner cannot grind `secret` against the final ticket
/// set alone (must commit `keccak256(secret)` before the entropy block is known).
/// @dev Reveal must occur within ~256 blocks after `entropyBlock` or `blockhash` returns zero and
/// `revealDraw` reverts — operate a manual fallback / VRF upgrade for production raffles.
contract RaffleTicketCampaign is ERC721Enumerable, Ownable, ReentrancyGuard {
    enum Phase {
        Active,
        Closed,
        Drawn
    }

    Phase public phase;
    uint256 public immutable mintPriceWei;
    uint256 public immutable maxSupply;
    address public immutable treasury;

    uint256 private _nextTokenId;
    string private baseTokenURI;

    bytes32 public drawCommitment;
    uint256 public winningTokenId;
    /// @notice Block whose hash is mixed into the winner index (set in `close()`).
    uint256 public entropyBlock;
    uint256 public constant ENTROPY_DELAY_BLOCKS = 5;

    event Minted(address indexed to, uint256 indexed tokenId);
    event PhaseClosed(uint256 totalMinted);
    event EntropyScheduled(uint256 entropyBlock);
    event DrawCommitted(bytes32 commitment);
    event WinnerDrawn(address indexed winner, uint256 indexed tokenId);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 mintPriceWei_,
        uint256 maxSupply_,
        address treasury_,
        string memory baseURI_,
        address initialOwner
    ) ERC721(name_, symbol_) Ownable(initialOwner) {
        require(treasury_ != address(0), "treasury");
        require(maxSupply_ > 0, "maxSupply");
        mintPriceWei = mintPriceWei_;
        maxSupply = maxSupply_;
        treasury = treasury_;
        baseTokenURI = baseURI_;
        _nextTokenId = 1;
    }

    function mint(uint256 quantity) external payable nonReentrant {
        require(phase == Phase.Active, "not active");
        require(quantity > 0 && quantity <= 20, "qty");
        uint256 supply = totalSupply();
        require(supply + quantity <= maxSupply, "sold out");
        uint256 cost = mintPriceWei * quantity;
        require(msg.value == cost, "payment");

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(msg.sender, tokenId);
            emit Minted(msg.sender, tokenId);
        }

        (bool ok,) = payable(treasury).call{value: msg.value}("");
        require(ok, "treasury");
    }

    function close() external onlyOwner {
        require(phase == Phase.Active, "phase");
        require(totalSupply() > 0, "empty");
        phase = Phase.Closed;
        entropyBlock = block.number + ENTROPY_DELAY_BLOCKS;
        emit PhaseClosed(totalSupply());
        emit EntropyScheduled(entropyBlock);
    }

    function commitDraw(bytes32 commitment) external onlyOwner {
        require(phase == Phase.Closed, "closed only");
        require(drawCommitment == bytes32(0), "committed");
        require(entropyBlock != 0, "entropy");
        require(block.number < entropyBlock, "late commit");
        drawCommitment = commitment;
        emit DrawCommitted(commitment);
    }

    function revealDraw(bytes32 secret) external onlyOwner {
        require(phase == Phase.Closed, "closed only");
        require(drawCommitment != bytes32(0), "!commit");
        require(keccak256(abi.encodePacked(secret)) == drawCommitment, "secret");
        require(entropyBlock != 0, "entropy");
        require(block.number > entropyBlock, "early reveal");
        require(block.number <= entropyBlock + 256, "entropy expired");
        uint256 bh = uint256(blockhash(entropyBlock));
        require(bh != 0, "no entropy");
        uint256 n = totalSupply();
        uint256 idx = uint256(keccak256(abi.encodePacked(bh, secret, address(this), n))) % n;
        uint256 tokenId = tokenByIndex(idx);
        winningTokenId = tokenId;
        phase = Phase.Drawn;
        emit WinnerDrawn(ownerOf(tokenId), tokenId);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }
}
