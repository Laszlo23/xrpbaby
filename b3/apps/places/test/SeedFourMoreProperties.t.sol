// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {PropertyRegistry} from "../src/PropertyRegistry.sol";
import {PropertyShareFactory} from "../src/PropertyShareFactory.sol";
import {ComplianceRegistry} from "../src/ComplianceRegistry.sol";
import {IComplianceRegistry} from "../src/interfaces/IComplianceRegistry.sol";
import {IPropertyShareToken} from "../src/interfaces/IPropertyShareToken.sol";
import {SeedTokenSupply} from "../script/SeedTokenSupply.sol";

contract SeedFourMorePropertiesTest is Test {
    address internal admin = address(0xA11);
    address internal registrar = address(0xB22);
    address internal treasury = address(0xC33);

    function testSeedFourMoreMatchesScriptLogic() public {
        PropertyRegistry registry = new PropertyRegistry(admin);
        bytes32 regRole = registry.REGISTRAR_ROLE();
        vm.prank(admin);
        registry.grantRole(regRole, registrar);

        ComplianceRegistry compliance = new ComplianceRegistry(admin);
        vm.prank(admin);
        compliance.setWalletStatus(treasury, IComplianceRegistry.Status.Verified);

        PropertyShareFactory factory = new PropertyShareFactory(address(registry), address(compliance), admin);
        bytes32 fReg = factory.REGISTRAR_ROLE();
        vm.prank(admin);
        factory.grantRole(fReg, registrar);

        string[4] memory ids = [
            "OG-DEMO-AT-004-REIFNITZ",
            "OG-DEMO-AT-005-LANDMARK-WV",
            "OG-DEMO-AT-006-1210-ZINS",
            "OG-DEMO-AT-007-1010-KURZ"
        ];
        string[4] memory symbols = ["DP4", "DP5", "DP6", "DP7"];
        uint256[4] memory valueUsd = [uint256(6_000_000), 9_500_000, 5_500_000, 14_500_000];

        vm.startPrank(registrar);
        for (uint256 i; i < 4; ++i) {
            bytes32 externalRef = keccak256(bytes(ids[i]));
            bytes32 metadataHash = keccak256(bytes(string.concat("buildingculture:demo:metadata:", ids[i])));
            uint256 propertyId = registry.registerProperty(externalRef, metadataHash, treasury);

            string memory name_ = string.concat("Prop ", _toString(i + 4));
            string memory uri = string.concat("https://buildingculture.demo/meta/at-", _toString(i + 4), ".json");

            uint256 cap = SeedTokenSupply.supplyCapWei(valueUsd[i]);
            address token = factory.createPropertyShare(
                propertyId,
                name_,
                symbols[i],
                uri,
                cap,
                treasury,
                cap,
                treasury
            );

            assertEq(IPropertyShareToken(token).propertyId(), propertyId);
            assertEq(factory.tokenByPropertyId(propertyId), token);
            assertEq(IPropertyShareToken(token).balanceOf(treasury), cap);
        }
        vm.stopPrank();
    }

    function _toString(uint256 v) internal pure returns (string memory) {
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
