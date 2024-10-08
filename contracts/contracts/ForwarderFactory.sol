// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "./Forwarder.sol";
import "./interfaces/IForwarderFactory.sol";

contract ForwarderFactory is IForwarderFactory {
    IWETH public immutable WETH;
    IGasStation public immutable GAS_STATION;
    ISwapRouter public immutable SWAP_ROUTER;

    constructor(IGasStation _gasStation, IWETH _weth, ISwapRouter _swapRouter) {
        WETH = _weth;
        GAS_STATION = _gasStation;
        SWAP_ROUTER = _swapRouter;
    }

    /// @inheritdoc	IForwarderFactory
    function createForwarder(address _forwardTo) public returns (address) {
        Forwarder _forwarder = new Forwarder{salt: _computeSalt(_forwardTo)}(
            GAS_STATION,
            WETH,
            SWAP_ROUTER,
            _forwardTo
        );

        emit ForwarderCreated(address(_forwarder), _forwardTo);

        return address(_forwarder);
    }

    /// @inheritdoc	IForwarderFactory
    function getForwarder(address _forwardTo) public view returns (address) {
        bytes memory bytecode = abi.encodePacked(
            type(Forwarder).creationCode,
            abi.encode(GAS_STATION, WETH, SWAP_ROUTER, _forwardTo)  
        );
        bytes32 fHash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                _computeSalt(_forwardTo),
                keccak256(bytecode)
            )
        );

        return address(uint160(uint(fHash)));
    }

    function _computeSalt(address _forwardTo) internal pure returns (bytes32) {
        return keccak256(abi.encode(_forwardTo));
    }
}
