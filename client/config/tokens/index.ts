import polyTokens from "./137.json"
import optTokens from "./10.json"

export type Token = {
    name: string
    symbol: string
    address: `0x${string}`
    decimals: number
    verified?: boolean
    image?: string
}

export const tokens: {
    [chainId: number]: Token[]
} = {
    137: polyTokens as Token[],
    10: optTokens as Token[]
}