// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IForwarderErrors {
    error EmptyBalance();
    error NotEnoughForFees(uint256 requested, uint256 actual);
    error RelayerFeeTooHigh(uint256 requested, uint256 actual);
    error FailedEthTransfer(address receipient, uint256 amount);
    error FailedTokenTransfer(address receipient, address token, uint256 amount);
}

interface IForwarderEvents {
    event ForwarderFlushed(address token, uint256 value);
}

interface IForwarder is IForwarderErrors, IForwarderEvents {
    function flushToken(address token) external;
}
