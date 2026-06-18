// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @title BcidSoulboundCredential — non-transferable credential NFTs for BCID holders
contract BcidSoulboundCredential is ERC721, AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    uint256 private _nextTokenId = 1;

    mapping(uint256 => bytes32) public credentialSchema;
    mapping(uint256 => bytes32) public evidenceHash;
    mapping(uint256 => address) public bcidHolder;

    error NonTransferable();
    error ZeroAddress();

    event CredentialIssued(
        address indexed holder,
        uint256 indexed tokenId,
        bytes32 schemaId,
        bytes32 evidenceHash
    );

    constructor(address admin) ERC721("BCID Credential", "BCIDCRED") {
        if (admin == address(0)) revert ZeroAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ISSUER_ROLE, admin);
    }

    function issue(address to, bytes32 schemaId, bytes32 evidenceHash_) external onlyRole(ISSUER_ROLE) returns (uint256) {
        if (to == address(0)) revert ZeroAddress();
        uint256 id = _nextTokenId++;
        credentialSchema[id] = schemaId;
        evidenceHash[id] = evidenceHash_;
        bcidHolder[id] = to;
        _safeMint(to, id);
        emit CredentialIssued(to, id, schemaId, evidenceHash_);
        return id;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string.concat("bcid-credential:", Strings.toString(tokenId));
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) revert NonTransferable();
        return super._update(to, tokenId, auth);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
