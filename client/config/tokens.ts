import polyTokens from "./tokens/137.json"

export type Token = {
    name: string
    symbol: string
    address: `0x${string}`
    decimals: number
    image?: string
}

export const tokens: {
    [chainId: number]: Token[]
} = {
    10: [
        {
            "name": "Dai Stablecoin",
            "symbol": "DAI",
            "address": "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
            "decimals": 18,
            "image": "https://app.uniswap.org/static/media/eth-logo.a1eb5a0f1291810970bc.png"
        },
        {
            "name": "Usdc Stablecoin",
            "symbol": "USDC",
            "address": "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
            "decimals": 18,
            "image": "https://app.uniswap.org/static/media/eth-logo.a1eb5a0f1291810970bc.png"
        }
    ],
    137: polyTokens as Token[]
}