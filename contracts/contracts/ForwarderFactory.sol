// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {Forwarder} from "./Forwarder.sol";
import {IWeth} from "./interfaces/IWeth.sol";
import {IForwarder} from "./interfaces/IForwarder.sol";
import {ISwapRouter} from "./interfaces/ISwapRouter.sol";
import {IQuoter} from "./interfaces/IQuoter.sol";
import {IForwarderFactory} from "./interfaces/IForwarderFactory.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

contract ForwarderFactory is IForwarderFactory {
    IWeth public weth;
    ISwapRouter public swapRouter;
    IQuoter public swapQuoter;
    IForwarder public implementation;

    constructor(ISwapRouter _swapRouter, IQuoter _swapQuoter, IWeth _weth) {
        swapRouter = _swapRouter;
        swapQuoter = _swapQuoter;
        weth = _weth;

        implementation = new Forwarder();
        implementation.initialize(address(this), swapRouter, swapQuoter, weth);
    }

    /// @inheritdoc	IForwarderFactory
    function createForwarder(address _forwardTo) public returns (address) {
        address _forwarder = Clones.cloneDeterministic(
            address(implementation),
            _computeSalt(_forwardTo)
        );
        IForwarder(payable(_forwarder)).initialize(
            _forwardTo,
            swapRouter,
            swapQuoter,
            weth
        );

        emit ForwarderCreated(address(_forwarder), _forwardTo);

        return address(_forwarder);
    }

    /// @inheritdoc	IForwarderFactory
    function getForwarder(address _forwardTo) public view returns (address) {
        return
            Clones.predictDeterministicAddress(
                address(implementation),
                _computeSalt(_forwardTo)
            );
    }

    function _computeSalt(address _forwardTo) internal pure returns (bytes32) {
        return keccak256(abi.encode(_forwardTo));
    }
}
