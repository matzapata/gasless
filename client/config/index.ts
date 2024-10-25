import { createPublicClient, createWalletClient, Hex, http, PrivateKeyAccount, PublicClient, WalletClient } from "viem"
import { polygon } from "viem/chains";
import { privateKeyToAccount } from 'viem/accounts'

// swap config ====================================================================

export const slippage = 97n;

export const swapFee = 3000n;

// providers ======================================================================

export const providers: {
    [chainId: number]: PublicClient;
} = {
    [137]: createPublicClient({
        chain: polygon,
        transport: http(),
    })
}
export const walletClients: {
    [chainId: number]: WalletClient
} = {
    [137]: createWalletClient({
        chain: polygon,
        transport: http(),
    })
}

// relayer accounts ===============================================================

export const relayerAccounts: {
    [chainId: number]: PrivateKeyAccount
} = {
    [137]: privateKeyToAccount("0x" + process.env.RELAYER_KEY as Hex)
}

// gas costs ======================================================================

// profit per tx
export const profitPerTxInEth: {
    [chainId: number]: bigint
} = {
    [137]: 300000n 
}

// cost of executing txs. Needed when forwarder is not deployed and so we can't estimate
export const gasPerTokenFlush: {
    [chainId: number]: bigint
} = {
    [137]: 300000n 
}
export const gasPerNativeFlush: {
    [chainId: number]: bigint
} = {
    [137]: 65000n
}

// contract deployments ============================================================

export const forwarderFactories: {
    [chainId: number]: `0x${string}`
} = {
    137: "0x5DE0035a215684578bABe97e19B50d35EC120755"
};
export const forwarderImplementations: {
    [chainId: number]: `0x${string}`
} = {
    137: "0xc1451C94C2AE786d747738B5f18d63596E9869be"
};
