// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @title BcidRegistry — soulbound Human BCID identity on Base
/// @notice Parallel standard to CultureLayerIdentity (.culture). Non-transferable.
contract BcidRegistry is ERC721, Ownable {
    using Strings for uint256;

    uint256 public constant MIN_HANDLE_LEN = 3;
    uint256 public constant MAX_HANDLE_LEN = 32;

    uint256 private _nextTokenId = 1;
    uint256 public mintPrice;

    mapping(bytes32 => uint256) public handleToTokenId;
    mapping(uint256 => string) private _handles;

    error HandleTaken();
    error InvalidHandle();
    error InsufficientPayment();
    error NonTransferable();

    event BcidMinted(address indexed owner, uint256 indexed tokenId, string handle, string did);

    constructor(address initialOwner, uint256 initialMintPrice) ERC721("Building Culture ID", "BCID") Ownable(initialOwner) {
        mintPrice = initialMintPrice;
    }

    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
    }

    function handleKey(string calldata handle) public pure returns (bytes32) {
        return keccak256(bytes(handle));
    }

    function _validateHandle(string calldata handle) internal pure {
        bytes memory h = bytes(handle);
        uint256 len = h.length;
        if (len < MIN_HANDLE_LEN || len > MAX_HANDLE_LEN) revert InvalidHandle();
        for (uint256 i = 0; i < len; i++) {
            bytes1 c = h[i];
            bool ok = (c >= 0x30 && c <= 0x39) || (c >= 0x61 && c <= 0x7a) || c == 0x2d;
            if (!ok) revert InvalidHandle();
        }
    }

    function isAvailable(string calldata handle) external view returns (bool) {
        _validateHandle(handle);
        return handleToTokenId[handleKey(handle)] == 0;
    }

    function getDid(uint256 tokenId) external view returns (string memory) {
        _requireOwned(tokenId);
        return string.concat("did:bcid:human:", Strings.toString(tokenId));
    }

    function getHandle(uint256 tokenId) external view returns (string memory) {
        _requireOwned(tokenId);
        return _handles[tokenId];
    }

    function mint(string calldata handle) external payable returns (uint256 tokenId) {
        _validateHandle(handle);
        bytes32 key = handleKey(handle);
        if (handleToTokenId[key] != 0) revert HandleTaken();
        if (msg.value < mintPrice) revert InsufficientPayment();

        tokenId = _nextTokenId++;
        handleToTokenId[key] = tokenId;
        _handles[tokenId] = handle;
        _safeMint(msg.sender, tokenId);

        emit BcidMinted(msg.sender, tokenId, handle, string.concat("did:bcid:human:", Strings.toString(tokenId)));
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) revert NonTransferable();
        return super._update(to, tokenId, auth);
    }
}
