import { createPublicClient, createWalletClient, http, PublicClient, WalletClient } from "viem"
import { polygon } from "viem/chains";

export const slippage = 97n / 100n;

export const swapFee = 3000n;

// public connections
export const providers: {
    [chainId: number]: PublicClient;
} = {
    [137]: createPublicClient({
        chain: polygon,
        transport: http(),
    })
}

// relayer accounts
export const relayerAccounts: {
    [chainId: number]: WalletClient
} = {
    [137]: createWalletClient({
        chain: polygon,
        transport: http(),
        account: "0xF754D0f4de0e815b391D997Eeec5cD07E59858F0",
        key: "TODO:"
    })
}


// profit per tx
export const profitPerTxInEth: {
    [chainId: number]: bigint
} = {
    [137]: 100n
}

// cost of executing a withdrawal with swap for eth in units of gas
export const gasPerWithdrawal: {
    [chainId: number]: bigint
} = {
    [137]: 100n
}


// forwarder factories
export const forwarderFactories: {
    [chainId: number]: `0x${string}`
} = {
    137: "0xDaA6099A78865e5d2fFBa7ffb996825cCEB362F9"
};

// forwarder implementations
export const forwarderImplementations: {
    [chainId: number]: `0x${string}`
} = {
    137: "0x7651D2Cf81E2E83C61125aad34871FA32c16D1c3"
};