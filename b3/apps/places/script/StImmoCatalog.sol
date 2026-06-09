// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Shared ST-IMMO catalog constants for seed scripts (keep in sync with data/property-catalog.json).
library StImmoCatalog {
    uint256 internal constant COUNT = 8;

    function externalRef(uint256 index) internal pure returns (string memory) {
        string[8] memory refs = [
            "STIX-AT-berggasse-35",
            "STIX-AT-jagdschlossgasse-81",
            "STIX-CA-whalewatching-reference",
            "STIX-AT-water-side-keutschach",
            "STIX-AT-landmark-bernhardsthal",
            "STIX-AT-altes-presshaus-katzelsdorf",
            "STIX-AT-department-store-bernhardsthal",
            "STIX-AT-alter-stadl-katzelsdorf"
        ];
        return refs[index];
    }

    function symbol(uint256 index) internal pure returns (string memory) {
        string[8] memory syms = ["OG1", "OG2", "OG3", "OG4", "OG5", "OG6", "OG7", "OG8"];
        return syms[index];
    }

    function name(uint256 index) internal pure returns (string memory) {
        string[8] memory names_ = [
            "Building Culture City Berggasse",
            "Building Culture City Jagdschlossgasse 81",
            "BuildingCultureLand - Whalewatching",
            "Water Side - Keutschach am See",
            "BuildingCultureLand - LandMark",
            "BuildingCultureLand - Altes Presshaus",
            "BuildingCultureLand - Former department store",
            "BuildingCultureLand - Alter Stadl"
        ];
        return names_[index];
    }

    function acquisitionEur(uint256 index) internal pure returns (uint256) {
        uint256[8] memory values = [
            uint256(15_917_000),
            8_300_000,
            2_900_000,
            10_500_000,
            10_900_000,
            950_000,
            850_000,
            650_000
        ];
        return values[index];
    }

    function metadataUri(uint256 propertyId) internal pure returns (string memory) {
        return string.concat(
            "https://app.buildingcultureid.space/places/api/reoc/",
            _toString(propertyId)
        );
    }

    function _toString(uint256 v) private pure returns (string memory) {
        if (v == 0) return "0";
        uint256 j = v;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        j = len;
        while (v != 0) {
            j--;
            bstr[j] = bytes1(uint8(48 + (v % 10)));
            v /= 10;
        }
        return string(bstr);
    }
}
