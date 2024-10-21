import { createPublicClient, createWalletClient, http, PublicClient, WalletClient } from "viem"
import { polygon } from "viem/chains";

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
        account: "0x5C69bEe701ef814700656Aa07159823a2d7E5d18",
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
    137: "0x5C69bEe701ef814700656Aa07159823a2d7E5d18"
};