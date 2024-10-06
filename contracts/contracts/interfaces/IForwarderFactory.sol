// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

interface IForwarderFactoryErrors {}

interface IForwarderFactoryEvents {
    event ForwarderCreated(address forwarder, address forwardTo);
}

interface IForwarderFactory is
    IForwarderFactoryEvents,
    IForwarderFactoryErrors
{
    function createForwarder(address _forwardTo) external returns (address);

    function getForwarder(address _forwardTo) external view returns (address);
}
