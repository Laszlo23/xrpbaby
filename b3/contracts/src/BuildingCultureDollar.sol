// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title BuildingCultureDollar
/// @notice BCD mint is capped at deployment. Genesis campaign mints via a single genesis claim contract;
///         fixed-price sale mints via a single sale contract; owner may treasury-mint remainder up to cap.
contract BuildingCultureDollar is ERC20Capped, Ownable {
    /// @notice The only caller allowed to genesis-mint beyond owner mint paths.
    address public genesisClaimContract;

    /// @notice The only caller allowed to `saleMint` (e.g. `BCDFixedPriceSale`). Set once.
    address public fixedSaleContract;

    /// @notice When true, `ownerMint` is permanently disabled (one-way).
    bool public ownerMintDisabled;

    event GenesisClaimContractSet(address indexed claim);
    event FixedSaleContractSet(address indexed sale);
    event OwnerMintDisabled();

    constructor(address initialOwner, uint256 cap_)
        ERC20("Building Culture Dollar", "BCD")
        ERC20Capped(cap_)
        Ownable(initialOwner)
    {}

    /// @notice Wire once after `BCDGenesisClaim` deployment.
    function setGenesisClaimContract(address claim) external onlyOwner {
        require(genesisClaimContract == address(0) && claim != address(0), "genesis set");
        genesisClaimContract = claim;
        emit GenesisClaimContractSet(claim);
    }

    /// @notice Wire once after `BCDFixedPriceSale` deployment.
    function setFixedSaleContract(address sale) external onlyOwner {
        require(fixedSaleContract == address(0) && sale != address(0), "sale set");
        fixedSaleContract = sale;
        emit FixedSaleContractSet(sale);
    }

    /// @notice Callable only by genesis claim router.
    function genesisMint(address to, uint256 amount) external {
        require(msg.sender == genesisClaimContract, "only genesis");
        _mint(to, amount);
    }

    /// @notice Callable only by fixed-price sale router.
    function saleMint(address to, uint256 amount) external {
        require(msg.sender == fixedSaleContract, "only sale");
        _mint(to, amount);
    }

    /// @notice Operational mint for treasury/airdrops/staking programs (within cap).
    function ownerMint(address to, uint256 amount) external onlyOwner {
        require(!ownerMintDisabled, "owner mint off");
        _mint(to, amount);
    }

    /// @notice Irreversibly disable `ownerMint` (genesis + cap remain). Use after treasury policy is finalized.
    function disableOwnerMintForever() external onlyOwner {
        require(!ownerMintDisabled, "already");
        ownerMintDisabled = true;
        emit OwnerMintDisabled();
    }
}
