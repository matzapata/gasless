import { EnvVar, useEnv } from "./env";
import optimismTokens from "../tokens/optimism-main.json";
import polygonTokens from "../tokens/polygon-main.json";

export enum ChainId {
    OPTIMISM = 10,
    POLYGON = 137,
}

interface INetworkConfig {
    NAME: string;
    TOKENS: { symbol: string, address: string }[],
    RPC_URL: string;
    UNISWAP_ROUTER: string,
    UNISWAP_QUOTER: string,
    UNISWAP_WETH: string,
    WHALE: string;
    WHALE_TOKEN: string;
    RElAYER_FEE: bigint;
    SWAP_FEE: bigint;
}

// uniswap quoter from 
// https://github.com/Uniswap/view-quoter-v3?tab=readme-ov-file#view-only-quoter-addresses

export const networkConfig: {
    [chainId: number]: INetworkConfig
} = {
    [ChainId.OPTIMISM]: {
        NAME: "optimism",
        TOKENS: optimismTokens,
        RPC_URL: useEnv(EnvVar.OPT_RPC_URL),
        UNISWAP_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        UNISWAP_QUOTER: "0x5e55c9e631fae526cd4b0526c4818d6e0a9ef0e3", 
        UNISWAP_WETH: "0x4200000000000000000000000000000000000006",
        WHALE: "0x802b65b5d9016621E66003aeD0b16615093f328b",
        WHALE_TOKEN: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
        RElAYER_FEE: BigInt(1000000000000000),
        SWAP_FEE: BigInt(3000),
    },
    [ChainId.POLYGON]: {
        NAME: "polygon",
        TOKENS: polygonTokens,
        RPC_URL: useEnv(EnvVar.POLYGON_RPC_URL),
        UNISWAP_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        UNISWAP_QUOTER: "0x5e55c9e631fae526cd4b0526c4818d6e0a9ef0e3",
        UNISWAP_WETH: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        WHALE: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
        WHALE_TOKEN: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
        RElAYER_FEE: BigInt(50000000000000000),
        SWAP_FEE: BigInt(3000),
    },
}
