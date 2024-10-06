// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {IWETH} from "./interfaces/IWETH.sol";
import {IQuoter} from "./interfaces/IQuoter.sol";
import {ISwapRouter} from "./interfaces/ISwapRouter.sol";
import {IERC20WithPermit} from "./interfaces/IERC20WithPermit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IGasStation, IGasStationEvents} from "./interfaces/IGasStation.sol";

contract GasStation is Ownable, IGasStation {
    uint24 internal SWAP_FEE;
    uint256 internal RELAYER_FEE;
    address public immutable WETH;
    ISwapRouter public immutable SWAP_ROUTER;
    IQuoter public immutable SWAP_QUOTER;

    mapping(address => bool) internal tokensWhitelist; // whitelist of available tokens (must support permit)

    constructor(
        ISwapRouter _swapRouter,
        IQuoter _swapQuoter,
        address _weth,
        address[] memory _tokensWhitelist,
        uint256 _relayerFee,
        uint24 _swapFee
    ) Ownable(msg.sender) {
        WETH = _weth;
        RELAYER_FEE = _relayerFee;
        SWAP_ROUTER = _swapRouter;
        SWAP_QUOTER = _swapQuoter;
        SWAP_FEE = _swapFee;

        for (uint i = 0; i < _tokensWhitelist.length; i++) {
            tokensWhitelist[_tokensWhitelist[i]] = true;
        }
    }

    function whitelistToken(
        address token,
        bool whitelisted
    ) external onlyOwner {
        tokensWhitelist[token] = whitelisted;
    }

    function isWhitelisted(address token) public view returns (bool) {
        return tokensWhitelist[token];
    }

    function setRelayerFee(uint256 _fee) external onlyOwner {
        RELAYER_FEE = _fee;

        emit FeeUpdate(_fee);
    }

    function getRelayerFee() external view returns (uint256) {
        return RELAYER_FEE;
    }

    function setSwapFee(uint24 _fee) external onlyOwner {
        SWAP_FEE = _fee;
    }

    function getSwapFee() external view returns (uint24) {
        return SWAP_FEE;
    }

    function quoteSwapForEth(
        address token, // Address of the ERC-20 token contract
        uint256 amount // Amount of tokens to pull
    ) public view returns (uint256, uint256) {
        IQuoter.QuoteExactInputSingleParams memory params = IQuoter
            .QuoteExactInputSingleParams({
                tokenIn: token,
                tokenOut: WETH,
                amountIn: amount,
                fee: SWAP_FEE,
                sqrtPriceLimitX96: 0
            });

        (uint256 amountOut, , , ) = /* uint160 sqrtPriceX96After */ /* uint32 initializedTicksCrossed */ /* uint256 gasEstimate */
        SWAP_QUOTER.quoteExactInputSingle(params);

        return (amountOut, RELAYER_FEE);
    }

    // Function to pull tokens from the user using permit and send ETH
    function swapForEth(
        address from, // Address owner of the erc20
        address token, // Address of the ERC-20 token contract
        uint256 amount, // Amount of tokens to pull
        uint256 minRelayerFee, // Minimum relayer fee
        uint256 deadline, // Permit deadline
        uint8 v, // v value for the signature
        bytes32 r, // r value for the signature
        bytes32 s // s value for the signature
    ) external {
        require(isWhitelisted(token), "Token not whitelisted");
        require(RELAYER_FEE >= minRelayerFee, "Relayer fee too high");

        // Permit token transfer using the provided signature
        IERC20WithPermit(token).permit(
            from, // Owner (user sending tokens)
            address(this), // Spender (this contract)
            amount, // Amount to be approved
            deadline, // Deadline for the permit
            v,
            r,
            s
        );

        // Transfer the approved tokens from the user to this contract
        IERC20WithPermit(token).transferFrom(from, address(this), amount);
        IERC20WithPermit(token).approve(address(SWAP_ROUTER), amount);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: token,
                tokenOut: address(WETH),
                recipient: address(this),
                amountIn: amount,
                amountOutMinimum: (amount * 97) / 100, // slippage of 3%
                fee: SWAP_FEE, // liquidity providers fee. 3000 bps = 0.3%
                deadline: block.timestamp + 5 * 60, // 5 minutes from the current block time
                sqrtPriceLimitX96: 0
            });
        uint256 amountOut = SWAP_ROUTER.exactInputSingle(params);

        // check that the ETH sent is enough to cover the relayer fee
        require(amountOut > RELAYER_FEE, "Not enough ETH to pay relayer fee");

        // unwrap WETH
        IWETH(WETH).withdraw(amountOut);

        // send the ETH to the recipient address. from is token owners so relayer can't modify
        (bool success, ) = payable(from).call{value: amountOut - RELAYER_FEE}(
            ""
        );
        require(success, "ETH transfer to receiver failed");

        // send fee to relayer
        (success, ) = msg.sender.call{value: RELAYER_FEE}("");
        require(success, "ETH transfer to relayer failed");
    }

    // Allow the contract to receive ETH after unwrapping WETH
    receive() external payable {}
}
