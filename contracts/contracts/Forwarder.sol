// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {IWeth} from "./interfaces/IWeth.sol";
import {IQuoter} from "./interfaces/IQuoter.sol";
import {ISwapRouter} from "./interfaces/ISwapRouter.sol";
import {IForwarder} from "./interfaces/IForwarder.sol";
import {Swapper} from "./Swapper.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Forwarder is IForwarder, Swapper, Initializable {
    address internal forwardTo;

    // EIP712 vars
    uint256 internal nonce;
    bytes32 private domainSeparator;

    /// @inheritdoc	IForwarder
    function initialize(
        address _forwardTo,
        ISwapRouter _swapRouter,
        IQuoter _swapQuoter,
        IWeth _weth
    ) public initializer {
        Swapper._initialize(_swapRouter, _swapQuoter, _weth);
        domainSeparator = _buildDomainSeparator("Forwarder", "1");

        forwardTo = _forwardTo;
    }

    /// @inheritdoc	IForwarder
    function getForwardTo() public view returns (address) {
        return forwardTo;
    }

    /// @inheritdoc	IForwarder
    function getNonce() public view returns (uint256) {
        return nonce;
    }

    modifier isFlushAuthorized(
        FlushParams memory params,
        bytes memory signature
    ) {
        if (msg.sender != forwardTo) {
            bytes32 digest = _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "Flush(address token,uint256 amount,uint256 amountOutMinimum,uint24 swapFee,uint256 swapDeadline,uint104 sqrtPriceLimitX96,uint256 relayerFee,uint256 nonce)"
                        ),
                        params.token,
                        params.amount,
                        params.amountOutMinimum,
                        params.swapFee,
                        params.swapDeadline,
                        params.sqrtPriceLimitX96,
                        params.relayerFee,
                        nonce
                    )
                )
            );

            address signer = ECDSA.recover(digest, signature);
            if (signer != forwardTo) {
                revert UnauthorizedFlush();
            }

            // Increment the nonce for the user to prevent replay of this signature
            nonce++;
        }

        _;
    }

    /// @inheritdoc	IForwarder
    function flushToken(address token, uint256 amount) external {
        IERC20(token).transfer(forwardTo, amount);

        emit ForwarderFlushed(token, amount);
    }

    /// @inheritdoc IForwarder
    function flushNative(
        FlushParams memory params,
        bytes memory signature
    ) external isFlushAuthorized(params, signature) {
        if (params.relayerFee > 0) {
            (bool relayerSuccess, ) = payable(msg.sender).call{
                value: params.relayerFee
            }("");
            if (relayerSuccess == false) {
                revert FailedEthTransfer(msg.sender, params.relayerFee);
            }
        }

        (bool success, ) = forwardTo.call{value: params.amount}("");
        if (success == false) {
            revert FailedEthTransfer(forwardTo, params.amount);
        }

        emit ForwarderFlushed(address(0), params.amount);
    }

    /// @inheritdoc	IForwarder
    function flushTokenWithNative(
        FlushParams memory params,
        bytes memory signature
    ) external isFlushAuthorized(params, signature) {
        uint256 amountOut = Swapper._swapForEth(
            params.token,
            params.amount,
            params.amountOutMinimum,
            params.swapFee,
            params.swapDeadline,
            params.sqrtPriceLimitX96
        );

        // check that the ETH sent is enough to cover the relayer fee
        if (amountOut < params.relayerFee) {
            revert NotEnoughForFees(params.relayerFee, amountOut);
        }

        // send the ETH to the recipient address
        uint256 forwardAmount = amountOut - params.relayerFee;
        (bool success, ) = forwardTo.call{value: forwardAmount}("");
        if (success == false) {
            revert FailedEthTransfer(forwardTo, forwardAmount);
        }

        IERC20(params.token).transfer(forwardTo, params.amount);

        // send fee to relayer
        (success, ) = msg.sender.call{value: params.relayerFee}("");
        if (success == false) {
            revert FailedEthTransfer(forwardTo, params.relayerFee);
        }
    }

    /// @inheritdoc	IForwarder
    function quoteSwapForNative(
        address token,
        uint256 amount,
        uint24 swapFee,
        uint160 sqrtPriceLimitX96
    ) external view returns (uint256) {
        return
            Swapper._quoteSwapForEth(token, amount, swapFee, sqrtPriceLimitX96);
    }

    /// @inheritdoc	IForwarder
    receive() external payable {}

    /// @dev Returns the domain separator for the current chain.
    function _buildDomainSeparator(string memory name, string memory version) private view returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    keccak256(
                        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                    ),
                    keccak256(bytes(name)),
                    keccak256(bytes(version)),
                    block.chainid,
                    address(this)
                )
            );
    }

    /// @dev Given an already https://eips.ethereum.org/EIPS/eip-712#definition-of-hashstruct[hashed struct], this
    /// function returns the hash of the fully encoded EIP712 message for this domain.
    /// This hash can be used together with {ECDSA-recover} to obtain the signer of a message.
    function _hashTypedDataV4(
        bytes32 structHash
    ) internal view virtual returns (bytes32) {
        return MessageHashUtils.toTypedDataHash(domainSeparator, structHash);
    }
}
