// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

/// @title CultureLayerIdentity — transferable onchain identity NFTs on Base
/// @notice Names are `handle` + TLD id (culture, build, home, eco, capital, city).
contract CultureLayerIdentity is ERC721, Ownable {
    using Strings for uint256;

    uint256 public constant FOUNDING_CAP = 5000;
    uint256 public constant MIN_HANDLE_LEN = 1;
    uint256 public constant MAX_HANDLE_LEN = 32;

    uint256 private _nextTokenId = 1;
    uint256 public mintPrice;

    /// @dev Optional HTTPS base for rich metadata, e.g. https://app.com/api/nft/
    string private _metadataBaseURI;

    /// @dev keccak256(abi.encode(handle, tldId)) => tokenId (0 = unminted)
    mapping(bytes32 => uint256) public nameToTokenId;

    struct IdentityData {
        string handle;
        uint8 tldId;
        uint64 mintedAt;
    }

    mapping(uint256 => IdentityData) private _identities;

    event IdentityMinted(
        address indexed minter,
        uint256 indexed tokenId,
        string handle,
        uint8 tldId,
        bool isFounding
    );

    error NameTaken();
    error InvalidHandle();
    error InvalidTld();
    error InsufficientPayment();
    error TokenNotFound();

    constructor(address initialOwner, uint256 initialMintPrice) ERC721("Culture Layer Identity", "CLID") Ownable(initialOwner) {
        mintPrice = initialMintPrice;
    }

    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
    }

    function setMetadataBaseURI(string calldata baseURI) external onlyOwner {
        _metadataBaseURI = baseURI;
    }

    function metadataBaseURI() external view returns (string memory) {
        return _metadataBaseURI;
    }

    function nameKey(string calldata handle, uint8 tldId) public pure returns (bytes32) {
        return keccak256(abi.encode(handle, tldId));
    }

    function isValidTld(uint8 tldId) public pure returns (bool) {
        return tldId < 6;
    }

    function tldLabel(uint8 tldId) public pure returns (string memory) {
        if (tldId == 0) return "culture";
        if (tldId == 1) return "build";
        if (tldId == 2) return "home";
        if (tldId == 3) return "eco";
        if (tldId == 4) return "capital";
        if (tldId == 5) return "city";
        revert InvalidTld();
    }

    function _validateHandle(string calldata handle) internal pure {
        bytes memory h = bytes(handle);
        uint256 len = h.length;
        if (len < MIN_HANDLE_LEN || len > MAX_HANDLE_LEN) revert InvalidHandle();
        for (uint256 i = 0; i < len; i++) {
            bytes1 c = h[i];
            bool ok = (c >= 0x30 && c <= 0x39) || (c >= 0x61 && c <= 0x7a);
            if (!ok) revert InvalidHandle();
        }
    }

    function isAvailable(string calldata handle, uint8 tldId) external view returns (bool) {
        if (!isValidTld(tldId)) return false;
        _validateHandle(handle);
        return nameToTokenId[nameKey(handle, tldId)] == 0;
    }

    function getTokenId(string calldata handle, uint8 tldId) external view returns (uint256) {
        if (!isValidTld(tldId)) return 0;
        return nameToTokenId[nameKey(handle, tldId)];
    }

    function totalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    function isFoundingMember(uint256 tokenId) public pure returns (bool) {
        return tokenId > 0 && tokenId <= FOUNDING_CAP;
    }

    function getIdentity(uint256 tokenId)
        external
        view
        returns (
            address owner_,
            string memory handle,
            uint8 tldId,
            uint64 mintedAt,
            bool isFounding
        )
    {
        if (_ownerOf(tokenId) == address(0)) revert TokenNotFound();
        IdentityData memory id = _identities[tokenId];
        return (_ownerOf(tokenId), id.handle, id.tldId, id.mintedAt, isFoundingMember(tokenId));
    }

    function mint(string calldata handle, uint8 tldId) external payable returns (uint256 tokenId) {
        if (!isValidTld(tldId)) revert InvalidTld();
        _validateHandle(handle);
        if (msg.value < mintPrice) revert InsufficientPayment();

        bytes32 key = nameKey(handle, tldId);
        if (nameToTokenId[key] != 0) revert NameTaken();

        tokenId = _nextTokenId++;
        nameToTokenId[key] = tokenId;
        _identities[tokenId] = IdentityData({
            handle: handle,
            tldId: tldId,
            mintedAt: uint64(block.timestamp)
        });

        _safeMint(msg.sender, tokenId);

        emit IdentityMinted(msg.sender, tokenId, handle, tldId, isFoundingMember(tokenId));
    }

    function withdraw() external onlyOwner {
        (bool ok,) = payable(owner()).call{value: address(this).balance}("");
        require(ok);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        if (bytes(_metadataBaseURI).length > 0) {
            return string.concat(_metadataBaseURI, tokenId.toString());
        }
        return _onchainTokenURI(tokenId);
    }

    function _onchainTokenURI(uint256 tokenId) internal view returns (string memory) {
        IdentityData memory id = _identities[tokenId];
        string memory tld = tldLabel(id.tldId);
        string memory svg = _buildSvg(id.handle, tld, tokenId, isFoundingMember(tokenId));
        string memory image = string.concat("data:image/svg+xml;base64,", Base64.encode(bytes(svg)));
        string memory name = string.concat(id.handle, ".", tld);
        string memory json = string.concat(
            '{"name":"',
            name,
            " - Culture Layer\",",
            '"description":"Transferable Culture Layer identity ',
            name,
            " on Base.\",",
            '"image":"',
            image,
            '"}'
        );
        return string.concat("data:application/json;base64,", Base64.encode(bytes(json)));
    }

    function _buildSvg(string memory handle, string memory tld, uint256 tokenId, bool founding)
        internal
        pure
        returns (string memory)
    {
        string memory accent = founding ? "#d4a853" : "#5b8def";
        string memory badge = founding ? "FOUNDING" : "CULTURE LAYER";
        return string.concat(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800">',
            '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">',
            '<stop offset="0%" stop-color="#12151c"/><stop offset="100%" stop-color="#0c0e14"/>',
            "</linearGradient></defs>",
            '<rect width="600" height="800" rx="32" fill="url(#bg)"/>',
            '<text x="48" y="72" fill="#888" font-family="monospace" font-size="12">',
            badge,
            "</text>",
            '<text x="48" y="340" fill="#f4f5f7" font-family="system-ui" font-size="64" font-weight="600">',
            handle,
            "</text>",
            '<text x="48" y="410" fill="',
            accent,
            '" font-family="serif" font-size="52" font-style="italic">.',
            tld,
            "</text>",
            '<text x="48" y="470" fill="#666" font-family="monospace" font-size="14">#',
            tokenId.toString(),
            "</text></svg>"
        );
    }
}
