// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/// @title AgentShareCampaign
/// @notice Gas-focused ERC721 “AI agent share” mints with daily cap, fee split (treasury / liquidity / referrals).
/// @dev Referrer rewards use a pull pattern so mint stays lean. `liquidityVault` receives ETH for off-chain LP pairing.
contract AgentShareCampaign is ERC721, Ownable, ReentrancyGuard, Pausable {
    using Strings for uint256;

    uint256 private constant BPS = 10_000;
    uint256 private constant DAY = 1 days;

    uint256 public immutable mintPriceWei;
    uint256 public immutable dailyMintCap;
    address public immutable treasury;
    /// @notice Receives the liquidity slice of each mint (treasury adds LP off-chain or via router).
    address public immutable liquidityVault;

    uint16 public immutable liquidityBps;
    uint16 public immutable referrerBps;

    string private baseTokenURI;

    uint256 private _nextId = 1;
    mapping(uint256 tokenId => uint8 agentTypeId) private _agentOf;

    mapping(uint256 dayIndex => uint256 minted) private _mintsPerDay;
    mapping(address => uint256) private _referralClaimable;

    error InvalidPayment();
    error DailyCap();
    error InvalidReferrer();

    event Minted(address indexed to, uint256 indexed tokenId, uint8 indexed agentTypeId, address referrer);
    event ReferralWithdrawn(address indexed to, uint256 amount);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 mintPriceWei_,
        uint256 dailyMintCap_,
        address treasury_,
        address liquidityVault_,
        uint16 liquidityBps_,
        uint16 referrerBps_,
        string memory baseURI_,
        address initialOwner
    ) ERC721(name_, symbol_) Ownable(initialOwner) {
        require(treasury_ != address(0) && liquidityVault_ != address(0), "addr");
        require(uint256(liquidityBps_) + uint256(referrerBps_) <= BPS, "bps");
        require(dailyMintCap_ != 0 && mintPriceWei_ != 0, "params");

        mintPriceWei = mintPriceWei_;
        dailyMintCap = dailyMintCap_;
        treasury = treasury_;
        liquidityVault = liquidityVault_;
        liquidityBps = liquidityBps_;
        referrerBps = referrerBps_;
        baseTokenURI = baseURI_;
    }

    function setBaseURI(string calldata newBase) external onlyOwner {
        baseTokenURI = newBase;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _dayIndex() private view returns (uint256) {
        return block.timestamp / DAY;
    }

    /// @param agentTypeId Agent catalog id (0–255); metadata resolves off-chain (Clanker-style agents share the same series).
    /// @param referrer Optional referral wallet; must not be `msg.sender`. Pull-based payout later.
    function mint(uint8 agentTypeId, address referrer) external payable nonReentrant whenNotPaused {
        if (msg.value != mintPriceWei) revert InvalidPayment();

        uint256 day = _dayIndex();
        if (_mintsPerDay[day] >= dailyMintCap) revert DailyCap();

        if (referrer == msg.sender) revert InvalidReferrer();

        uint256 price = mintPriceWei;
        uint256 liqWei = (price * uint256(liquidityBps)) / BPS;
        uint256 refWei = referrer != address(0) ? (price * uint256(referrerBps)) / BPS : 0;
        uint256 treasuryWei = price - liqWei - refWei;

        _mintsPerDay[day]++;

        uint256 tokenId = _nextId++;
        _agentOf[tokenId] = agentTypeId;
        _safeMint(msg.sender, tokenId);

        if (liqWei != 0) {
            (bool okL,) = liquidityVault.call{value: liqWei}("");
            require(okL, "liq");
        }
        if (refWei != 0) {
            _referralClaimable[referrer] += refWei;
        }
        if (treasuryWei != 0) {
            (bool okT,) = treasury.call{value: treasuryWei}("");
            require(okT, "treasury");
        }

        emit Minted(msg.sender, tokenId, agentTypeId, referrer);
    }

    function withdrawReferral() external nonReentrant whenNotPaused {
        uint256 owed = _referralClaimable[msg.sender];
        if (owed == 0) return;
        _referralClaimable[msg.sender] = 0;
        (bool ok,) = msg.sender.call{value: owed}("");
        require(ok, "ref");
        emit ReferralWithdrawn(msg.sender, owed);
    }

    function referralClaimable(address referrer) external view returns (uint256) {
        return _referralClaimable[referrer];
    }

    function mintsToday() external view returns (uint256) {
        return _mintsPerDay[_dayIndex()];
    }

    function agentTypeOf(uint256 tokenId) external view returns (uint8) {
        return _agentOf[tokenId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string.concat(baseTokenURI, tokenId.toString());
    }
}
