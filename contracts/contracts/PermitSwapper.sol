// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Swapper} from "./Swapper.sol";
import {IWeth} from "./interfaces/IWeth.sol";
import {IQuoter} from "./interfaces/IQuoter.sol";
import {ISwapRouter} from "./interfaces/ISwapRouter.sol";
import {IERC20WithPermit} from "./interfaces/IErc20Permit.sol";
import {IPermitSwapper} from "./interfaces/IPermitSwapper.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract PermitSwapper is IPermitSwapper, Initializable, Swapper {
    address public owner;
    
    // whitelist of available tokens (must support permit)
    mapping(address => bool) internal tokensWhitelist;

    function initialize(
        ISwapRouter _swapRouter,
        IQuoter _swapQuoter,
        IWeth _weth,
        address[] memory _tokensWhitelist
    ) public initializer {
        owner = msg.sender;

        for (uint24 i = 0; i < _tokensWhitelist.length; i++) {
            tokensWhitelist[_tokensWhitelist[i]] = true;
        }

        Swapper._initialize(_swapRouter, _swapQuoter, _weth);
    }

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert OnlyOwner();
        }

        _;
    }

    /// @inheritdoc	IPermitSwapper
    function whitelistToken(
        address token,
        bool whitelisted
    ) external onlyOwner {
        tokensWhitelist[token] = whitelisted;

        emit TokenWhitelisted(token);
    }

    /// @inheritdoc	IPermitSwapper
    function isWhitelisted(address token) public view returns (bool) {
        return tokensWhitelist[token];
    }

    /// @inheritdoc	IPermitSwapper
    function quoteSwapForEth(
        address token,
        uint256 amount,
        uint24 swapFee,
        uint160 sqrtPriceLimitX96
    ) public view returns (uint256 amountOut) {
        return
            Swapper._quoteSwapForEth(token, amount, swapFee, sqrtPriceLimitX96);
    }

    /// @inheritdoc	IPermitSwapper
    function swapForEth(
        address from, // Address owner of the erc20
        address token, // Address of the ERC-20 token contract
        uint256 amount, // Amount of tokens to pull
        uint256 amountOutMinimum,
        uint24 swapFee,
        uint256 deadline,
        uint104 sqrtPriceLimitX96,
        uint256 relayerFee, // Relayer fee
        uint256 d, // Permit deadline
        uint8 v, // v value for the signature
        bytes32 r, // r value for the signature
        bytes32 s // s value for the signature
    ) external {
        if (!isWhitelisted(token)) {
            revert TokenNotWhitelisted(token);
        }

        // Permit token transfer using the provided signature
        IERC20WithPermit(token).permit(
            from, // owner (user sending tokens)
            address(this), // spender (this contract)
            amount,
            d,
            v,
            r,
            s
        );

        // Transfer the approved tokens from the user to this contract
        IERC20WithPermit(token).transferFrom(from, address(this), amount);

        // swap for ETH
        uint256 amountOut = Swapper._swapForEth(
            token,
            amount,
            amountOutMinimum,
            swapFee,
            deadline,
            sqrtPriceLimitX96
        );

        // check that the ETH sent is enough to cover the relayer fee
        if (amountOut < relayerFee) {
            revert NotEnoughForFees(relayerFee, amountOut);
        }

        // send the ETH to the recipient address. from is token owners so relayer can't modify
        uint256 forwardAmount = amountOut - relayerFee;
        (bool success, ) = payable(from).call{value: forwardAmount}("");
        if (success == false) {
            revert FailedEthTransfer(from, forwardAmount);
        }

        // send fee to relayer
        (success, ) = msg.sender.call{value: relayerFee}("");
        if (success == false) {
            revert FailedEthTransfer(from, relayerFee);
        }
    }

    /// @inheritdoc	IPermitSwapper
    receive() external payable {}
}
