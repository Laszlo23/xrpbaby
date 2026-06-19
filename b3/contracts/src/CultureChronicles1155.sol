// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @title CultureChronicles1155
/// @notice ERC-1155 story chapters — scarce editions, launch pricing, optional skip key for sequential mint gate.
contract CultureChronicles1155 is ERC1155, Ownable, ReentrancyGuard, Pausable {
    uint256 public constant EDITION_COUNT = 11;
    uint256 public constant SKIP_KEY_PRICE_WEI = 0.00055 ether;

    address public immutable treasury;
    uint256 public launchEndsAt;

    mapping(uint256 => uint256) public editionPriceWei;
    mapping(uint256 => uint256) public editionLaunchPriceWei;
    mapping(uint256 => uint256) public editionMaxSupply;
    mapping(uint256 => uint256) public editionMinted;
    mapping(address => bool) public hasSkipKey;

    string private _baseTokenURI;

    event EditionMinted(address indexed to, uint256 indexed editionId, uint256 quantity);
    event SkipKeyPurchased(address indexed buyer);

    constructor(
        address treasury_,
        uint256 launchEndsAt_,
        string memory baseURI_,
        address initialOwner
    ) ERC1155("") Ownable(initialOwner) {
        require(treasury_ != address(0), "treasury");
        treasury = treasury_;
        launchEndsAt = launchEndsAt_;
        _baseTokenURI = baseURI_;
        _initEditions();
    }

    function _initEditions() internal {
        uint256[11] memory supplies = [uint256(777), 777, 777, 333, 333, 777, 777, 111, 111, 333, 77];
        uint256[11] memory prices = [
            uint256(0.00028 ether),
            0.00028 ether,
            0.00028 ether,
            0.00041 ether,
            0.00041 ether,
            0.00028 ether,
            0.00028 ether,
            0.00081 ether,
            0.00081 ether,
            0.00041 ether,
            0.00283 ether
        ];

        for (uint256 i = 0; i < EDITION_COUNT; i++) {
            uint256 id = i + 1;
            editionMaxSupply[id] = supplies[i];
            editionPriceWei[id] = prices[i];
            if (id <= 3) {
                editionLaunchPriceWei[id] = 0.00019 ether;
            }
        }
    }

    function setBaseURI(string calldata newBase) external onlyOwner {
        _baseTokenURI = newBase;
    }

    function setLaunchEndsAt(uint256 ts) external onlyOwner {
        launchEndsAt = ts;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Active mint price — launch window for editions 1–3.
    function editionPriceWeiActive(uint256 editionId) public view returns (uint256) {
        require(editionId >= 1 && editionId <= EDITION_COUNT, "edition");
        if (editionId <= 3 && block.timestamp < launchEndsAt && editionLaunchPriceWei[editionId] > 0) {
            return editionLaunchPriceWei[editionId];
        }
        return editionPriceWei[editionId];
    }

    function requiresPriorEdition(uint256 editionId) public pure returns (bool) {
        return editionId > 1 && editionId <= EDITION_COUNT;
    }

    function canMintEdition(address account, uint256 editionId) public view returns (bool) {
        if (editionId < 1 || editionId > EDITION_COUNT) return false;
        if (!requiresPriorEdition(editionId)) return true;
        if (hasSkipKey[account]) return true;
        return balanceOf(account, editionId - 1) > 0;
    }

    function buySkipKey() external payable nonReentrant whenNotPaused {
        require(!hasSkipKey[msg.sender], "has key");
        require(msg.value == SKIP_KEY_PRICE_WEI, "payment");
        hasSkipKey[msg.sender] = true;
        emit SkipKeyPurchased(msg.sender);
        _forward(msg.value);
    }

    function mint(uint256 editionId, uint256 quantity) external payable nonReentrant whenNotPaused {
        require(editionId >= 1 && editionId <= EDITION_COUNT, "edition");
        require(quantity > 0 && quantity <= 10, "qty");
        require(canMintEdition(msg.sender, editionId), "prior");
        require(editionMinted[editionId] + quantity <= editionMaxSupply[editionId], "sold out");

        uint256 cost = editionPriceWeiActive(editionId) * quantity;
        require(msg.value == cost, "payment");

        editionMinted[editionId] += quantity;
        _mint(msg.sender, editionId, quantity, "");
        emit EditionMinted(msg.sender, editionId, quantity);
        _forward(msg.value);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        require(tokenId >= 1 && tokenId <= EDITION_COUNT, "uri");
        return string.concat(_baseTokenURI, Strings.toString(tokenId), ".json");
    }

    function withdraw() external onlyOwner {
        uint256 b = address(this).balance;
        if (b > 0) {
            (bool ok,) = payable(owner()).call{value: b}("");
            require(ok, "withdraw");
        }
    }

    function _forward(uint256 amount) internal {
        (bool ok,) = payable(treasury).call{value: amount}("");
        require(ok, "treasury");
    }
}
