// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {IWeth} from "./interfaces/IWeth.sol";
import {IQuoter} from "./interfaces/IQuoter.sol";
import {ISwapRouter} from "./interfaces/ISwapRouter.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Swapper {
    IWeth public weth;
    IQuoter public swapQuoter;
    ISwapRouter public swapRouter;

   function _initialize(
        ISwapRouter _swapRouter,
        IQuoter _swapQuoter,
        IWeth _weth
    ) internal {
        weth = _weth;
        swapRouter = _swapRouter;
        swapQuoter = _swapQuoter;
    }

    function _swapForEth(
        address token,
        uint256 amount,
        uint256 amountOutMinimum,
        uint24 fee,
        uint256 deadline,
        uint160 sqrtPriceLimitX96
    ) internal returns (uint256) {
        IERC20(token).approve(address(swapRouter), amount);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: token,
                tokenOut: address(weth),
                recipient: address(this),
                amountIn: amount,
                amountOutMinimum: amountOutMinimum, // slippage of 3%
                fee: fee, // liquidity providers fee. example 3000 bps = 0.3%
                deadline: deadline, // 5 minutes from the current block time
                sqrtPriceLimitX96: sqrtPriceLimitX96
            });

        uint256 amountOut = swapRouter.exactInputSingle(params);

        // unwrap WETH
        IWeth(weth).withdraw(amountOut);

        return amountOut;
    }

    function _quoteSwapForEth(
        address token,
        uint256 amount,
        uint24 swapFee,
        uint160 sqrtPriceLimitX96
    ) internal view returns (uint256) {
        IQuoter.QuoteExactInputSingleParams memory params = IQuoter
            .QuoteExactInputSingleParams({
                tokenIn: token,
                tokenOut: address(weth),
                amountIn: amount,
                fee: swapFee,
                sqrtPriceLimitX96: sqrtPriceLimitX96
            });

        (
            uint256 amountOut /* uint160 sqrtPriceX96After */ /* uint32 initializedTicksCrossed */ /* uint256 gasEstimate */,
            ,
            ,

        ) = swapQuoter.quoteExactInputSingle(params);

        return amountOut;
    }
}
