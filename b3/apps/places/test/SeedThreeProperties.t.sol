// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {PropertyRegistry} from "../src/PropertyRegistry.sol";
import {PropertyShareFactory} from "../src/PropertyShareFactory.sol";
import {ComplianceRegistry} from "../src/ComplianceRegistry.sol";
import {IComplianceRegistry} from "../src/interfaces/IComplianceRegistry.sol";
import {IPropertyShareToken} from "../src/interfaces/IPropertyShareToken.sol";
import {SeedTokenSupply} from "../script/SeedTokenSupply.sol";

contract SeedThreePropertiesTest is Test {
    address internal admin = address(0xA11);
    address internal registrar = address(0xB22);
    address internal treasury = address(0xC33);

    function testSeedThreeMatchesScriptLogic() public {
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

        string[3] memory ids = ["DEMO-US-CA-001", "DEMO-US-CA-002", "DEMO-US-CA-003"];
        string[3] memory symbols = ["DP1", "DP2", "DP3"];
        uint256[3] memory valueUsd = [uint256(17_575_000), 7_000_000, 9_500_000];

        vm.startPrank(registrar);
        for (uint256 i; i < 3; ++i) {
            bytes32 externalRef = keccak256(bytes(ids[i]));
            bytes32 metadataHash = keccak256(bytes(string.concat("buildingculture:demo:metadata:", ids[i])));
            uint256 propertyId = registry.registerProperty(externalRef, metadataHash, treasury);

            string memory name_ = string.concat("Demo Property ", _toString(i + 1));
            string memory uri = string.concat("https://buildingculture.demo/meta/", _toString(i + 1), ".json");

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
