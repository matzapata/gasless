import { EnvVar, useEnv } from "./env";

export enum ChainId {
    OPTIMISM = 10,
}

interface INetworkConfig {
    TOKENS: { 
        USDC: string;
        OTHER: string;
    },
    RPC_URL: string;
    UNISWAP_ROUTER: string,
    UNISWAP_QUOTER: string,
    UNISWAP_WETH: string,
    WHALE: string;
    FEE: bigint;
}

export const networkConfig: {
    [chainId: number]: INetworkConfig
} = {
    [ChainId.OPTIMISM]: {
        TOKENS: {
            USDC: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
            OTHER: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1"
        },
        RPC_URL: useEnv(EnvVar.OPT_RPC_URL),
        UNISWAP_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        UNISWAP_QUOTER: "0x5e55c9e631fae526cd4b0526c4818d6e0a9ef0e3",
        UNISWAP_WETH: "0x4200000000000000000000000000000000000006",
        WHALE: "0x802b65b5d9016621E66003aeD0b16615093f328b",
        FEE: BigInt(1000000000000000),
    }
}
