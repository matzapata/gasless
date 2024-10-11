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
    137: [
        {
            "name": "Dai Stablecoin",
            "symbol": "DAI",
            "address": "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
            "decimals": 18
        },
        {
            "name": "Usdc Stablecoin",
            "symbol": "USDC",
            "address": "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
            "decimals": 18
        }
    ]
}