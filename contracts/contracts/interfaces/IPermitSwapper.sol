// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {IWeth} from "./IWeth.sol";
import {IQuoter} from "./IQuoter.sol";
import {ISwapRouter} from "./ISwapRouter.sol";

interface IPermitSwapperEvents {
    event TokenWhitelisted(address token);
}

interface IPermitSwapperErrors {
    error OnlyOwner();
    error TokenNotWhitelisted(address token);
    error NotEnoughForFees(uint256 requested, uint256 actual);
    error FailedEthTransfer(address receipient, uint256 amount);
}

interface IPermitSwapper is IPermitSwapperEvents, IPermitSwapperErrors {
    function initialize(
        ISwapRouter _swapRouter,
        IQuoter _swapQuoter,
        IWeth _weth,
        address[] memory _tokensWhitelist
    ) external;

    /// @notice Whitelists a token
    /// @dev Only tokens with permit should be whitelisted
    /// @param token The token to whitelist
    /// @param whitelisted Whether to whitelist or not
    function whitelistToken(address token, bool whitelisted) external;

    /// @notice Checks if a token is whitelisted
    /// @param token The token to check
    /// @return Whether the token is whitelisted
    function isWhitelisted(address token) external view returns (bool);

    /// @notice Estimates swaps tokens for ETH
    /// @param token The token to swap
    /// @param amount The amount of tokens to swap
    /// @return amountOut The amount of ETH to send
    function quoteSwapForEth(
        address token, // Address of the ERC-20 token contract
        uint256 amount, // Amount of tokens to pull
        uint24 swapFee,
        uint160 sqrtPriceLimitX96
    ) external view returns (uint256 amountOut);

    /// @notice Swaps tokens for ETH
    /// @param from The owner of the erc20
    /// @param token The token to swap
    /// @param amount The amount of tokens to swap
    /// @param relayerFee The minimum relayer fee
    /// @param deadline The deadline
    /// @param v The v value for the signature
    /// @param r The r value for the signature
    /// @param s The s value for the signature
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
    ) external;

    /// @notice Allows reception of native when unwrapping weth
    receive() external payable;
}
