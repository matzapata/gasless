// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IGasStationEvents {
    event FeeUpdate(uint256 fee);
}

interface IGasStationErrors {
    // error NotEnoughForFees(uint256 requested, uint256 actual);
}

interface IGasStation is IGasStationEvents, IGasStationErrors {
    /// @notice Sets the uniswap swap fee
    /// @param _fee The new uniswap swap fee
    function setSwapFee(uint24 _fee) external;

    /// @notice Returns the uniswap swap fee
    /// @return The uniswap swap fee
    function getSwapFee() external returns (uint24);

    /// @notice Sets the relayer fee
    /// @param _fee The new relayer fee
    function setRelayerFee(uint256 _fee) external;

    /// @notice Returns the relayer fee
    /// @return The relayer fee
    function getRelayerFee() external returns (uint256);

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
    /// @return relayerFee The relayer fee
    function quoteSwapForEth(
        address token, // Address of the ERC-20 token contract
        uint256 amount // Amount of tokens to pull
    ) external view returns (uint256 amountOut, uint256 relayerFee);

    /// @notice Swaps tokens for ETH
    /// @param from The owner of the erc20
    /// @param token The token to swap
    /// @param amount The amount of tokens to swap
    /// @param minRelayerFee The minimum relayer fee
    /// @param deadline The deadline
    /// @param v The v value for the signature
    /// @param r The r value for the signature
    /// @param s The s value for the signature
    function swapForEth(
        address from, // Address owner of the erc20
        address token, // Address of the ERC-20 token contract
        uint256 amount, // Amount of tokens to pull
        uint256 minRelayerFee, // Minimum relayer fee
        uint256 deadline, // Permit deadline
        uint8 v, // v value for the signature
        bytes32 r, // r value for the signature
        bytes32 s // s value for the signature
    ) external;

    /// @notice Allows reception of native when unwrapping weth
    receive() external payable;
}
