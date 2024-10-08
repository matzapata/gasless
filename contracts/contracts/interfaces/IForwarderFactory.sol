// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

interface IForwarderFactoryErrors {}

interface IForwarderFactoryEvents {
    /// @notice Emitted when a forwarder is created
    /// @param forwarder The forwarder that was created
    /// @param forwardTo The address to which the tokens will be forwarded
    event ForwarderCreated(address forwarder, address forwardTo);
}

interface IForwarderFactory is
    IForwarderFactoryEvents,
    IForwarderFactoryErrors
{
    /// @notice Creates a new forwarder
    /// @param _forwardTo The address to which the tokens will be forwarded
    /// @return address of the forwarder that belongs to the forwardTo
    function createForwarder(address _forwardTo) external returns (address);

    /// @notice Returns the address of the forwarder that belongs to the forwardTo
    /// @dev Computes deterministic deployment address. Doensn't ensure it's deployed.
    /// @param _forwardTo the address to which the tokens will be forwarded
    /// @return address of the forwarder that belongs to the forwardTo
    function getForwarder(address _forwardTo) external view returns (address);
}
