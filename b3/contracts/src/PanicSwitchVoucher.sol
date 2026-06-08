// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @title PanicSwitchVoucher
/// @notice Owner-minted ERC-721 voucher for hidden Panic Switch riddle completions.
contract PanicSwitchVoucher is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _nextId = 1;
    string private _baseTokenURI;
    mapping(bytes32 => bool) public claimDigestUsed;

    event PanicVoucherMinted(address indexed to, uint256 indexed tokenId, bytes32 indexed claimDigest);

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        address initialOwner
    ) ERC721(name_, symbol_) Ownable(initialOwner) {
        _baseTokenURI = baseURI_;
    }

    function setBaseURI(string calldata newBase) external onlyOwner {
        _baseTokenURI = newBase;
    }

    function mintVoucher(address to, bytes32 claimDigest) external onlyOwner returns (uint256 tokenId) {
        require(to != address(0), "INVALID_TO");
        require(!claimDigestUsed[claimDigest], "CLAIM_DIGEST_USED");
        claimDigestUsed[claimDigest] = true;
        tokenId = _nextId++;
        _safeMint(to, tokenId);
        emit PanicVoucherMinted(to, tokenId, claimDigest);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        string memory base = _baseURI();
        if (bytes(base).length == 0) return "";
        return string.concat(base, tokenId.toString(), ".json");
    }
}

