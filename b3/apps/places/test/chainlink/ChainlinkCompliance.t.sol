// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ComplianceRegistry} from "../../src/ComplianceRegistry.sol";
import {ComplianceRegistryAdapter} from "../../src/compliance/ComplianceRegistryAdapter.sol";
import {ChainlinkAceAdapter} from "../../src/compliance/ChainlinkAceAdapter.sol";
import {RestrictedPropertyShareToken} from "../../src/RestrictedPropertyShareToken.sol";
import {PropertyRegistry} from "../../src/PropertyRegistry.sol";
import {IComplianceRegistry} from "../../src/interfaces/IComplianceRegistry.sol";

contract ChainlinkComplianceTest is Test {
  ComplianceRegistry internal compliance;
  ComplianceRegistryAdapter internal adapter;
  ChainlinkAceAdapter internal aceAdapter;
  RestrictedPropertyShareToken internal token;

  address internal admin = address(0xA11);
  address internal alice = address(0xA);
  address internal bob = address(0xB0B);

  function setUp() public {
    compliance = new ComplianceRegistry(admin);
    adapter = new ComplianceRegistryAdapter(compliance);
    aceAdapter = new ChainlinkAceAdapter(compliance, admin);

    PropertyRegistry registry = new PropertyRegistry(admin);
    vm.prank(admin);
    compliance.setWalletStatus(alice, IComplianceRegistry.Status.Verified);
    vm.prank(admin);
    compliance.setWalletStatus(admin, IComplianceRegistry.Status.Verified);

    token = new RestrictedPropertyShareToken(
      "Test",
      "TST",
      1,
      address(registry),
      "uri",
      0,
      admin,
      100 ether,
      admin,
      compliance
    );
  }

  function test_uRWA_canTransfer_verified() public view {
    assertTrue(token.canSend(alice));
    assertTrue(token.canReceive(alice));
    assertTrue(token.canTransfer(admin, alice, 1 ether));
  }

  function test_uRWA_rejects_unverified() public view {
    assertFalse(token.canReceive(bob));
  }

  function test_adapter_matches_registry() public view {
    assertTrue(adapter.canTransfer(admin, alice, 1));
    assertFalse(adapter.canTransfer(admin, bob, 1));
  }

  function test_ace_adapter_fallback_without_module() public view {
    assertTrue(aceAdapter.canReceive(alice));
    assertFalse(aceAdapter.canReceive(bob));
  }

  function test_frozen_blocks_send() public {
    vm.prank(admin);
    token.setFrozen(alice, true);
    assertFalse(token.canSend(alice));
  }
}
