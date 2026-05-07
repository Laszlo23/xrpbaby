// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @title GenesisVaultPass
/// @notice ERC-721 vault access pass (one tier per deployment). Fixed supply; mint price forwarded to treasury.
contract GenesisVaultPass is ERC721Enumerable, Ownable, ReentrancyGuard, Pausable {
    uint256 public immutable mintPriceWei;
    uint256 public immutable maxSupply;
    address public immutable treasury;

    uint256 private _nextTokenId;
    string private baseTokenURI;

    event Minted(address indexed to, uint256 indexed tokenId);

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

    /// @notice Update metadata base (e.g. after IPFS pin). Append trailing slash if your files live under folders per id.
    function setBaseURI(string calldata newBase) external onlyOwner {
        baseTokenURI = newBase;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function mint(uint256 quantity) external payable nonReentrant whenNotPaused {
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

    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string.concat(_baseURI(), Strings.toString(tokenId), ".json");
    }

    function withdraw() external onlyOwner {
        uint256 b = address(this).balance;
        if (b > 0) {
            (bool ok,) = payable(owner()).call{value: b}("");
            require(ok, "withdraw");
        }
    }
}
