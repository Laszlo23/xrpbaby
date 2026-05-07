// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {BuildingCultureDollar} from "../src/BuildingCultureDollar.sol";
import {BCDFixedPriceSale} from "../src/BCDFixedPriceSale.sol";

contract MockERC20Pay is ERC20 {
    constructor() ERC20("Pay", "PAY") {}

    function mint(address to, uint256 a) external {
        _mint(to, a);
    }
}

contract BCDFixedPriceSaleTest is Test {
    address internal owner = address(this);
    address internal treasury = address(0xBEEF);
    address internal alice = address(0xA11CE);

    uint256 internal constant CAP = 1_000_000 ether;
    uint256 internal constant RID = 1;

    BuildingCultureDollar internal token;
    BCDFixedPriceSale internal saleEth;

    function setUp() public {
        token = new BuildingCultureDollar(owner, CAP);
        saleEth = new BCDFixedPriceSale(owner, address(token), treasury, address(0));
        token.setFixedSaleContract(address(saleEth));
        vm.deal(alice, 100 ether);
    }

    function _activeRoundPublic(uint256 pricePerBcd) internal view returns (BCDFixedPriceSale.Round memory) {
        return BCDFixedPriceSale.Round({
            start: uint64(block.timestamp),
            end: uint64(block.timestamp + 7 days),
            merkleRoot: bytes32(0),
            paymentPerWholeBcd: pricePerBcd,
            maxBcdWei: 1000 ether,
            perWalletPublicCapWei: 100 ether
        });
    }

    function testPublicRoundEth() public {
        uint256 price = 0.01 ether;
        saleEth.configureRound(RID, _activeRoundPublic(price));

        uint256 buyAmt = 10 ether;
        uint256 pay = (buyAmt * price) / 1 ether;
        uint256 balBefore = treasury.balance;

        vm.prank(alice);
        saleEth.buy{value: pay}(RID, buyAmt, 0, new bytes32[](0));

        assertEq(token.balanceOf(alice), buyAmt);
        assertEq(treasury.balance, balBefore + pay);
    }

    function testPublicRoundEthRefundsDust() public {
        uint256 price = 0.01 ether;
        saleEth.configureRound(RID, _activeRoundPublic(price));
        uint256 buyAmt = 10 ether;
        uint256 pay = (buyAmt * price) / 1 ether;
        vm.prank(alice);
        saleEth.buy{value: pay + 0.5 ether}(RID, buyAmt, 0, new bytes32[](0));
        assertEq(alice.balance, 100 ether - pay);
    }

    function testPrivateMerkleRound() public {
        uint256 maxAlloc = 50 ether;
        bytes32 leaf = keccak256(abi.encode(RID, alice, maxAlloc));
        bytes32 root = leaf;
        bytes32[] memory proof = new bytes32[](0);

        uint256 price = 0.02 ether;
        BCDFixedPriceSale.Round memory r = BCDFixedPriceSale.Round({
            start: uint64(block.timestamp),
            end: uint64(block.timestamp + 7 days),
            merkleRoot: root,
            paymentPerWholeBcd: price,
            maxBcdWei: 500 ether,
            perWalletPublicCapWei: 0
        });
        saleEth.configureRound(RID, r);

        uint256 buyAmt = 20 ether;
        uint256 pay = (buyAmt * price) / 1 ether;
        vm.prank(alice);
        saleEth.buy{value: pay}(RID, buyAmt, maxAlloc, proof);
        assertEq(token.balanceOf(alice), buyAmt);
    }

    function testPrivateRevertsOverAllocation() public {
        uint256 maxAlloc = 10 ether;
        bytes32 leaf = keccak256(abi.encode(RID, alice, maxAlloc));
        saleEth.configureRound(
            RID,
            BCDFixedPriceSale.Round({
                start: uint64(block.timestamp),
                end: uint64(block.timestamp + 7 days),
                merkleRoot: leaf,
                paymentPerWholeBcd: 0.01 ether,
                maxBcdWei: 500 ether,
                perWalletPublicCapWei: 0
            })
        );
        uint256 pay = (11 ether * 0.01 ether) / 1 ether;
        vm.prank(alice);
        vm.expectRevert(bytes("alloc"));
        saleEth.buy{value: pay}(RID, 11 ether, maxAlloc, new bytes32[](0));
    }

    function testRevertsBadProof() public {
        bytes32 wrong = keccak256("nope");
        saleEth.configureRound(
            RID,
            BCDFixedPriceSale.Round({
                start: uint64(block.timestamp),
                end: uint64(block.timestamp + 7 days),
                merkleRoot: wrong,
                paymentPerWholeBcd: 0.01 ether,
                maxBcdWei: 500 ether,
                perWalletPublicCapWei: 0
            })
        );
        vm.prank(alice);
        vm.expectRevert(bytes("proof"));
        saleEth.buy{value: 1 ether}(RID, 1 ether, 100 ether, new bytes32[](0));
    }

    function testPaused() public {
        saleEth.configureRound(RID, _activeRoundPublic(0.01 ether));
        saleEth.pause();
        vm.prank(alice);
        vm.expectRevert();
        saleEth.buy{value: 0.1 ether}(RID, 10 ether, 0, new bytes32[](0));
    }

    function testSaleMintOnlySale() public {
        vm.expectRevert(bytes("only sale"));
        token.saleMint(alice, 1 ether);
    }

    function testCannotSetSaleTwice() public {
        vm.expectRevert(bytes("sale set"));
        token.setFixedSaleContract(address(0x1234));
    }

    function testERC20Payment() public {
        MockERC20Pay payTok = new MockERC20Pay();
        BuildingCultureDollar t2 = new BuildingCultureDollar(owner, CAP);
        BCDFixedPriceSale sale20 = new BCDFixedPriceSale(owner, address(t2), treasury, address(payTok));
        t2.setFixedSaleContract(address(sale20));

        uint256 price = 2e6; // 2 USDC-like units per 1 BCD (6 dp)
        sale20.configureRound(
            RID,
            BCDFixedPriceSale.Round({
                start: uint64(block.timestamp),
                end: uint64(block.timestamp + 7 days),
                merkleRoot: bytes32(0),
                paymentPerWholeBcd: price,
                maxBcdWei: 1000 ether,
                perWalletPublicCapWei: 0
            })
        );

        uint256 buyAmt = 10 ether;
        uint256 owed = (buyAmt * price) / 1 ether;
        payTok.mint(alice, owed);
        vm.prank(alice);
        payTok.approve(address(sale20), owed);

        vm.prank(alice);
        sale20.buy(RID, buyAmt, 0, new bytes32[](0));

        assertEq(t2.balanceOf(alice), buyAmt);
        assertEq(payTok.balanceOf(treasury), owed);
    }

    function testRespectsCap() public {
        BuildingCultureDollar small = new BuildingCultureDollar(owner, 100 ether);
        BCDFixedPriceSale saleSmall = new BCDFixedPriceSale(owner, address(small), treasury, address(0));
        small.setFixedSaleContract(address(saleSmall));
        vm.deal(alice, 10 ether);
        saleSmall.configureRound(
            RID,
            BCDFixedPriceSale.Round({
                start: uint64(block.timestamp),
                end: uint64(block.timestamp + 7 days),
                merkleRoot: bytes32(0),
                paymentPerWholeBcd: 1 wei,
                maxBcdWei: 500 ether,
                perWalletPublicCapWei: 0
            })
        );

        vm.prank(alice);
        vm.expectRevert(); // ERC20Capped: cap exceeded
        saleSmall.buy{value: 200}(RID, 200 ether, 0, new bytes32[](0));
    }
}
