import { Address, createPublicClient, createWalletClient, http, PublicClient, WalletClient } from "viem"
import { polygon } from "viem/chains";

export const slippage = 97n;

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
        account: process.env.RELAYER_ACCOUNT! as Address,
        key: process.env.RELAYER_KEY!,
    })
}


// profit per tx
export const profitPerTxInEth: {
    [chainId: number]: bigint
} = {
    [137]: 100000n // TODO:
}

// cost of executing a flush with swap for eth in units of gas
export const gasPerTokenFlush: {
    [chainId: number]: bigint
} = {
    [137]: 100000n // TODO:
}

export const gasPerNativeFlush: {
    [chainId: number]: bigint
} = {
    [137]: 100n // TODO:
}

// forwarder factories
export const forwarderFactories: {
    [chainId: number]: `0x${string}`
} = {
    137: "0x22498dc72F94D40624854bAeB798EDeA4d17f77d"
};

// forwarder implementations
export const forwarderImplementations: {
    [chainId: number]: `0x${string}`
} = {
    137: "0xc813C6A971e99f6582099Cfc72F21A2FA1499E69"
};