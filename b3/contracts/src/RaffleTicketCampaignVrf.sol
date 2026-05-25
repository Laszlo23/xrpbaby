// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {VRFCoordinatorV2Interface} from "./chainlink/VRFCoordinatorV2Interface.sol";

/// @title RaffleTicketCampaignVrf
/// @notice Fixed-price ERC721 tickets; winner selected via Chainlink VRF v2 (provably fair on Base).
/// @dev Configure coordinator, subscription, and keyHash per https://docs.chain.link/vrf/v2-5/supported-networks
contract RaffleTicketCampaignVrf is ERC721Enumerable, Ownable, ReentrancyGuard {
  enum Phase {
    Active,
    Closed,
    VrfRequested,
    Drawn
  }

  Phase public phase;
  uint256 public immutable mintPriceWei;
  uint256 public immutable maxSupply;
  address public immutable treasury;

  VRFCoordinatorV2Interface public immutable vrfCoordinator;
  bytes32 public immutable keyHash;
  uint64 public immutable subscriptionId;
  uint16 public constant REQUEST_CONFIRMATIONS = 3;
  uint32 public constant CALLBACK_GAS_LIMIT = 250_000;

  uint256 private _nextTokenId;
  string private baseTokenURI;

  uint256 public vrfRequestId;
  uint256 public winningTokenId;
  uint256[] private _randomWords;

  event Minted(address indexed to, uint256 indexed tokenId);
  event PhaseClosed(uint256 totalMinted);
  event VrfRequested(uint256 indexed requestId);
  event WinnerDrawn(address indexed winner, uint256 indexed tokenId, uint256 randomWord);

  error NotActive();
  error NotClosed();
  error VrfPending();
  error AlreadyDrawn();

  constructor(
    string memory name_,
    string memory symbol_,
    uint256 mintPriceWei_,
    uint256 maxSupply_,
    address treasury_,
    string memory baseURI_,
    address vrfCoordinator_,
    bytes32 keyHash_,
    uint64 subscriptionId_,
    address initialOwner
  ) ERC721(name_, symbol_) Ownable(initialOwner) {
    require(treasury_ != address(0) && vrfCoordinator_ != address(0), "zero");
    require(maxSupply_ > 0, "maxSupply");
    mintPriceWei = mintPriceWei_;
    maxSupply = maxSupply_;
    treasury = treasury_;
    baseTokenURI = baseURI_;
    vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinator_);
    keyHash = keyHash_;
    subscriptionId = subscriptionId_;
    _nextTokenId = 1;
  }

  function mint(uint256 quantity) external payable nonReentrant {
    if (phase != Phase.Active) revert NotActive();
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
    if (phase != Phase.Active) revert NotActive();
    require(totalSupply() > 0, "empty");
    phase = Phase.Closed;
    emit PhaseClosed(totalSupply());
  }

  function requestWinnerDraw() external onlyOwner {
    if (phase != Phase.Closed) revert NotClosed();
    phase = Phase.VrfRequested;
    vrfRequestId = vrfCoordinator.requestRandomWords(
      keyHash, subscriptionId, REQUEST_CONFIRMATIONS, CALLBACK_GAS_LIMIT, 1
    );
    emit VrfRequested(vrfRequestId);
  }

  /// @notice Called by VRF coordinator (raw fulfill for MVP; production uses verified callback).
  function rawFulfillRandomWords(uint256 requestId, uint256[] memory randomWords) external {
    require(msg.sender == address(vrfCoordinator), "only coordinator");
    require(requestId == vrfRequestId, "bad request");
    require(phase == Phase.VrfRequested, "phase");
    _randomWords = randomWords;
    uint256 n = totalSupply();
    uint256 idx = randomWords[0] % n;
    uint256 tokenId = tokenByIndex(idx);
    winningTokenId = tokenId;
    phase = Phase.Drawn;
    emit WinnerDrawn(ownerOf(tokenId), tokenId, randomWords[0]);
  }

  function _baseURI() internal view override returns (string memory) {
    return baseTokenURI;
  }
}
