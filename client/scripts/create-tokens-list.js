require("dotenv").config();
const { ethers } = require("ethers");
const { writeFileSync } = require("fs");

const weth = {
    137: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    10: "0x4200000000000000000000000000000000000006"
};
const uniswapFactory = {
    137: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    10: "0x1F98431c8aD98523631AE4a59f267346ea31F984"
};
const rpc = {
    137: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
    10: `https://opt-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
}
const feeTier = 3000; //  0.3%

async function check(chainId) {
    const provider = new ethers.providers.JsonRpcProvider(rpc[chainId]);
    const factoryContract = new ethers.Contract(uniswapFactory[chainId], [
        "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address)"
    ], provider);

    const revisedTokenList = []
    const chainTokens = require(`../config/tokens/${chainId}.json`);
    for (const token of chainTokens) {
        const tokenAddress = token.address;

        const pool = await factoryContract.getPool(tokenAddress, weth[chainId], feeTier)
        console.log("pool", pool, tokenAddress, weth[chainId], feeTier);
        if (pool !== ethers.constants.AddressZero) {
            // token pair exists
            revisedTokenList.push(token);
            console.log("✅", tokenAddress);
        } else {
            // token pair does not exist
            console.log("❌", tokenAddress);
        }

        // avoid rate limit
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // write revised token list
    writeFileSync(`./${chainId}.json`, JSON.stringify(revisedTokenList));
}

check(10);
