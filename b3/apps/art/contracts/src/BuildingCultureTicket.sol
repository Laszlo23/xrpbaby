// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Building Culture raffle ticket (ERC-721)
/// @notice Minted only by BuildingCultureHub; each token maps to one edition.
contract BuildingCultureTicket is ERC721, Ownable {
    address public hub;

    uint256 private _nextTokenId;
    mapping(uint256 tokenId => uint256 editionId) public tokenEdition;

    error NotHub();
    error HubAlreadySet();

    modifier onlyHub() {
        if (msg.sender != hub) revert NotHub();
        _;
    }

    constructor(address initialOwner) ERC721("Building Culture Ticket", "BCTKT") Ownable(initialOwner) {}

    function setHub(address hubAddress) external onlyOwner {
        if (hub != address(0)) revert HubAlreadySet();
        hub = hubAddress;
    }

    function mint(address to, uint256 editionId) external onlyHub returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        tokenEdition[tokenId] = editionId;
        _safeMint(to, tokenId);
    }

    function totalMinted() external view returns (uint256) {
        return _nextTokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string(
            abi.encodePacked(
                "https://buildingculture.art/ticket/",
                _toString(tokenEdition[tokenId]),
                "/",
                _toString(tokenId)
            )
        );
    }

    function _toString(uint256 value) private pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
