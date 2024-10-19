// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {IWeth} from "./interfaces/IWeth.sol";
import {IQuoter} from "./interfaces/IQuoter.sol";
import {ISwapRouter} from "./interfaces/ISwapRouter.sol";
import {IForwarder} from "./interfaces/IForwarder.sol";
import {Swapper} from "./Swapper.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract Forwarder is IForwarder, Swapper, Initializable {
    address internal forwardTo;

    /// @inheritdoc	IForwarder
    function initialize(
        address _forwardTo,
        ISwapRouter _swapRouter,
        IQuoter _swapQuoter,
        IWeth _weth
    ) public initializer {
        Swapper._initialize(_swapRouter, _swapQuoter, _weth);

        forwardTo = _forwardTo;
    }

    /// @inheritdoc	IForwarder
    function getForwardTo() public view returns (address) {
        return forwardTo;
    }

    /// @inheritdoc	IForwarder
    function flushToken(address token, uint256 amount) external {
        IERC20(token).transfer(forwardTo, amount);

        emit ForwarderFlushed(token, amount);
    }

    /// @inheritdoc IForwarder
    function flushNative(uint256 amount) external {
        (bool success, ) = forwardTo.call{value: amount}("");
        if (success == false) {
            revert FailedEthTransfer(forwardTo, amount);
        }

        emit ForwarderFlushed(address(0), amount);
    }

    /// @inheritdoc	IForwarder
    function flushTokenWithNative(
        address token,
        uint256 amount,
        uint256 amountOutMinimum,
        uint24 swapFee,
        uint256 deadline,
        uint104 sqrtPriceLimitX96,
        uint256 relayerFee
    ) external {
        uint256 amountOut = Swapper._swapForEth(
            token,
            amount,
            amountOutMinimum,
            swapFee,
            deadline,
            sqrtPriceLimitX96
        );

        // check that the ETH sent is enough to cover the relayer fee
        if (amountOut < relayerFee) {
            revert NotEnoughForFees(relayerFee, amountOut);
        }

        // send the ETH to the recipient address
        uint256 forwardAmount = amountOut - relayerFee;
        (bool success, ) = forwardTo.call{value: forwardAmount}("");
        if (success == false) {
            revert FailedEthTransfer(forwardTo, forwardAmount);
        }

        IERC20(token).transfer(forwardTo, amount);

        // send fee to relayer
        (success, ) = msg.sender.call{value: relayerFee}("");
        if (success == false) {
            revert FailedEthTransfer(forwardTo, relayerFee);
        }
    }

    /// @inheritdoc	IForwarder
    function quoteSwapForNative(
        address token,
        uint256 amount,
        uint24 swapFee,
        uint160 sqrtPriceLimitX96
    ) external view returns (uint256) {
        return Swapper._quoteSwapForEth(token, amount, swapFee, sqrtPriceLimitX96);
    }

    /// @inheritdoc	IForwarder
    receive() external payable {}
}
