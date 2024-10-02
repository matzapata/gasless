// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./interfaces/IWETH.sol";
import "./interfaces/IQuoter.sol";
import "./interfaces/ISwapRouter.sol";
import "./interfaces/IERC20WithPermit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ThisForThat is Ownable {
    uint256 public RELAYER_FEE;
    address public immutable WETH;
    ISwapRouter public immutable SWAP_ROUTER;
    IQuoter public immutable SWAP_QUOTER;
    uint24 public immutable SWAP_FEE = 3000;

    mapping(address => bool) tokensWhitelist; // whitelist of available tokens (must support permit)

    // events
    event FeeUpdate(uint256 fee);

    constructor(
        ISwapRouter _swapRouter,
        IQuoter _swapQuoter,
        address _weth,
        address[] memory _tokensWhitelist,
        uint256 _relayerFee
    ) Ownable(msg.sender) {
        WETH = _weth;
        RELAYER_FEE = _relayerFee;
        SWAP_ROUTER = _swapRouter;
        SWAP_QUOTER = _swapQuoter;

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

    function quoteSwapForEth(
        address token, // Address of the ERC-20 token contract
        uint256 amount // Amount of tokens to pull
    ) public view returns (uint256, uint256) {
        require(isWhitelisted(token), "Token not whitelisted");

        IQuoter.QuoteExactInputSingleParams memory params = IQuoter
            .QuoteExactInputSingleParams({
                tokenIn: token,
                tokenOut: WETH,
                amountIn: amount,
                fee: SWAP_FEE,
                sqrtPriceLimitX96: 0
            });

        (
            uint256 amountOut,
            /* uint160 sqrtPriceX96After */,
            /* uint32 initializedTicksCrossed */,
            /* uint256 gasEstimate */
        ) = SWAP_QUOTER.quoteExactInputSingle(params);

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
        (bool success, ) = payable(from).call{value: amountOut - RELAYER_FEE}("");
        require(success, "ETH transfer to receiver failed");

        // send fee to relayer
        (success, ) = msg.sender.call{value: RELAYER_FEE}("");
        require(success, "ETH transfer to relayer failed");
    }

    // set fee
    function setFee(uint256 _fee) external onlyOwner {
        RELAYER_FEE = _fee;

        emit FeeUpdate(_fee);
    }

    // Allow the contract to receive ETH after unwrapping WETH
    receive() external payable {}
}
