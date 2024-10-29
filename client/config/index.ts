import { Address, Chain, createPublicClient, createWalletClient, Hex, http, PrivateKeyAccount, PublicClient, WalletClient } from "viem"
import { optimism, polygon } from "viem/chains";
import { privateKeyToAccount } from 'viem/accounts'

// swap config ====================================================================

export const slippage = 97n;

export const swapFee = 3000n;

// providers ======================================================================

export const providers: {
    [chainId: number]: PublicClient;
} = {
    [137]: createPublicClient({
        chain: polygon as Chain,
        transport: http(),
    }),
    [10]: createPublicClient({
        chain: optimism as Chain,
        transport: http(),
    }),
}
export const walletClients: {
    [chainId: number]: WalletClient
} = {
    [137]: createWalletClient({
        chain: polygon,
        transport: http(),
    }),
    [10]: createWalletClient({
        chain: optimism,
        transport: http(),
    })
}

// relayer accounts ===============================================================

export const relayerAccounts: {
    [chainId: number]: PrivateKeyAccount
} = {
    [137]: privateKeyToAccount("0x" + process.env.RELAYER_KEY as Hex),
    [10]: privateKeyToAccount("0x" + process.env.RELAYER_KEY as Hex)
}

// gas costs ======================================================================

// profit per tx
export const profitPerTxInEth: {
    [chainId: number]: bigint
} = {
    [137]: 100000n,
    [10]: 100000n 
}

// cost of executing txs. Needed when forwarder is not deployed and so we can't estimate
export const gasPerTokenFlush: {
    [chainId: number]: bigint
} = {
    [137]: 310000n, 
    [10]: 310000n 
}
export const gasPerNativeFlush: {
    [chainId: number]: bigint
} = {
    [137]: 70000n,
    [10]: 70000n
}

// contract deployments ============================================================

export const forwarderFactories: {
    [chainId: number]: Address
} = {
    137: "0x369031DE215c03C2ef84012AFa64AC56f8FA5655",
    10: "0xe3F5C14B10009bAEAEb6c2e8f694040d548B327D"
};
export const forwarderImplementations: {
    [chainId: number]: Address
} = {
    137: "0xE78065821ed30571353E0C9f29AdfF9dD30df8d2",
    10: "0x9178781eE3AC05Ae2c08e90E35Fc0476ae93C4E0"
};
