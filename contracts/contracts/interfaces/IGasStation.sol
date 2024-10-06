// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IGasStationEvents {
    event FeeUpdate(uint256 fee);
}

interface IGasStationErrors {
    // error NotEnoughForFees(uint256 requested, uint256 actual);
}

interface IGasStation is IGasStationEvents, IGasStationErrors {
    function setSwapFee(uint24 _fee) external;
    function getSwapFee() external returns (uint24);

     function setRelayerFee(uint256 _fee) external;
    function getRelayerFee() external returns (uint256);

    function whitelistToken(address token, bool whitelisted) external;
    function isWhitelisted(address token) external view returns (bool);

    function quoteSwapForEth(
        address token, // Address of the ERC-20 token contract
        uint256 amount // Amount of tokens to pull
    ) external view returns (uint256 amountOut, uint256 relayerFee);
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

    // Allow the contract to receive ETH after unwrapping WETH
    receive() external payable;
}
