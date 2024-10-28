// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {IWeth} from "./IWeth.sol";
import {IQuoter} from "./IQuoter.sol";
import {ISwapRouter} from "./ISwapRouter.sol";

interface IForwarderErrors {
    error EmptyBalance();
    error NotEnoughForFees(uint256 requested, uint256 actual);
    error FailedEthTransfer(address receipient, uint256 amount);
    error FailedTransfer(address receipient, address token, uint256 amount);
    error FailedTokenTransfer(
        address receipient,
        address token,
        uint256 amount
    );
    error UnauthorizedFlush();
}

/// @title Forwarder Events interface
/// @notice Specify forwarder events
interface IForwarderEvents {
    /// @notice Emitted when a token is flushed
    /// @param token The token that was flushed
    /// @param value The amount flushed
    /// @param fee The fee of the flush
    event ForwarderFlushed(address token, uint256 value, uint256 fee);
}

/// @title Forwarder interface
/// @notice Interface for the forwarder
interface IForwarder is IForwarderErrors, IForwarderEvents {

    struct FlushParams {
        address token;
        uint256 amount;
        uint256 amountOutMinimum;
        uint24 swapFee;
        uint256 swapDeadline;
        uint104 sqrtPriceLimitX96;
        uint256 relayerFee;
    }

    function initialize(
        address forwardTo,
        ISwapRouter swapRouter,
        IQuoter swapQuoter,
        IWeth weth
    ) external;

    /// @notice Returns the address to which the tokens will be forwarded
    /// @return address the address to which the tokens will be forwarded
    function getForwardTo() external view returns (address);

    /// @notice Returns the nonce of the forwarder
    /// @return uint256 the nonce
    function getNonce() external view returns (uint256);

    /// @notice Flushes amount of token to forwardTo
    /// @dev Ment as a security for users to take tokens away
    /// @param token The token to be flushed
    /// @param amount The amount to be flushed
    function flushToken(address token, uint256 amount) external;

    /// @notice Flushes amount of native to forwardTo
    /// @dev Ment as a security for users to take tokens away
    /// @param params The parameters necessary for the flush 
    /// @param signature The signature of the user authorizing the flush. May be empty if user himself is flushing
    function flushNative(
        FlushParams memory params,
        bytes memory signature
    ) external;

    /// @notice Swaps amount of token to native and sends it allong with remaining token to forwardTo
    /// @param params The parameters necessary for the flush
    /// @param signature the signature of the user authorizing the flush
    function flushTokenWithNative(
        FlushParams memory params,
        bytes memory signature
    ) external;

    /// @notice Estimates how much native will be received from a swap
    /// @param token The token to be flushed
    /// @param amount The amount to be swapt for native
    /// @param swapFee uniswap param
    /// @param sqrtPriceLimitX96 uniswap param
    /// @return amountOut The amount of the received token
    function quoteSwapForNative(
        address token,
        uint256 amount,
        uint24 swapFee,
        uint160 sqrtPriceLimitX96
    ) external view returns (uint256);

    /// @notice Gets called when native is deposited. Should forward to forwardTo
    receive() external payable;
}
