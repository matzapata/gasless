// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {IWeth} from "./IWeth.sol";
import {IQuoter} from "./IQuoter.sol";
import {ISwapRouter} from "./ISwapRouter.sol";

interface IForwarderErrors {
    error EmptyBalance();
    error NotEnoughForFees(uint256 requested, uint256 actual);
    error FailedEthTransfer(address receipient, uint256 amount);
    error FailedTokenTransfer(
        address receipient,
        address token,
        uint256 amount
    );
}

/// @title Forwarder Events interface
/// @notice Specify forwarder events
interface IForwarderEvents {
    /// @notice Emitted when a token is flushed
    /// @param token The token that was flushed
    /// @param value The amount flushed
    event ForwarderFlushed(address token, uint256 value);
}

/// @title Forwarder interface
/// @notice Interface for the forwarder
interface IForwarder is IForwarderErrors, IForwarderEvents {
    function initialize(
        address forwardTo,
        ISwapRouter swapRouter,
        IQuoter swapQuoter,
        IWeth weth
    ) external;

    /// @notice Returns the address to which the tokens will be forwarded
    /// @return address the address to which the tokens will be forwarded
    function getForwardTo() external view returns (address);

    /// @notice Flushes amount of token to forwardTo
    /// @dev Ment as a security for users to take tokens away
    /// @param token The token to be flushed
    /// @param amount The amount to be flushed
    function flushToken(address token, uint256 amount) external;

    /// @notice Flushes amount of native to forwardTo
    /// @dev Ment as a security for users to take tokens away
    /// @param amount The amount to be flushed
    function flushNative(uint256 amount) external;

    /// @notice Swaps amount of token to native and sends it allong with remaining token to forwardTo
    /// @param token The token to be flushed
    /// @param amount The amount to be swapt for native
    /// @param relayerFee The minimum relayer fee. Limited on maximum to the fee set by GasStation
    function flushTokenWithNative(
        address token,
        uint256 amount,
        uint256 amountOutMinimum,
        uint24 swapFee,
        uint256 deadline,
        uint104 sqrtPriceLimitX96,
        uint256 relayerFee
    ) external;

    /// @notice Gets called when native is deposited. Should forward to forwardTo
    receive() external payable;
}
