// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IComplianceRegistry} from "./interfaces/IComplianceRegistry.sol";
import {IPropertyShareFactoryMinimal} from "./interfaces/IPropertyShareFactoryMinimal.sol";

/// @notice Soulbound commemorative NFT minted after holding property shares (one per wallet per property).
contract PropertyShareProof is ERC721, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    IComplianceRegistry public immutable COMPLIANCE;
    IPropertyShareFactoryMinimal public immutable SHARE_FACTORY;

    uint256 private _nextTokenId = 1;
    string private _baseTokenURI;

    mapping(uint256 tokenId => uint256 propertyId) public propertyOf;
    mapping(address holder => mapping(uint256 propertyId => bool)) public claimed;

    error NonTransferable();
    error ZeroAddress();
    error NoShareBalance();
    error AlreadyClaimed();
    error UnknownProperty();
    error NotVerified();

    constructor(
        address admin_,
        IComplianceRegistry compliance_,
        IPropertyShareFactoryMinimal shareFactory_,
        string memory name_,
        string memory symbol_,
        string memory baseTokenURI_
    ) ERC721(name_, symbol_) {
        if (admin_ == address(0) || address(compliance_) == address(0) || address(shareFactory_) == address(0)) {
            revert ZeroAddress();
        }
        COMPLIANCE = compliance_;
        SHARE_FACTORY = shareFactory_;
        _baseTokenURI = baseTokenURI_;
        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _grantRole(MINTER_ROLE, admin_);
    }

    function setBaseURI(string calldata newBase) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = newBase;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string.concat(_baseURI(), Strings.toString(tokenId));
    }

    /// @notice Mint proof for `propertyId` if caller holds any share balance and passes KYC.
    function claim(uint256 propertyId) external {
        if (!COMPLIANCE.isVerified(msg.sender)) revert NotVerified();
        if (claimed[msg.sender][propertyId]) revert AlreadyClaimed();

        address share = SHARE_FACTORY.tokenByPropertyId(propertyId);
        if (share == address(0)) revert UnknownProperty();
        if (IERC20(share).balanceOf(msg.sender) == 0) revert NoShareBalance();

        claimed[msg.sender][propertyId] = true;
        uint256 id = _nextTokenId++;
        propertyOf[id] = propertyId;
        _safeMint(msg.sender, id);
    }

    /// @notice Admin mint (e.g. promotions) — still requires verified recipient.
    function mint(address to, uint256 propertyId) external onlyRole(MINTER_ROLE) {
        if (!COMPLIANCE.isVerified(to)) revert NotVerified();
        if (claimed[to][propertyId]) revert AlreadyClaimed();
        address share = SHARE_FACTORY.tokenByPropertyId(propertyId);
        if (share == address(0)) revert UnknownProperty();
        if (IERC20(share).balanceOf(to) == 0) revert NoShareBalance();

        claimed[to][propertyId] = true;
        uint256 id = _nextTokenId++;
        propertyOf[id] = propertyId;
        _safeMint(to, id);
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
