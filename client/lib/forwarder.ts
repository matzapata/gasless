import { ForwarderFactoryABI } from "@/config/abis/ForwarderFactory";
import { Address, erc20Abi, formatEther, formatUnits, getContract, parseUnits, zeroAddress } from "viem";
import { forwarderFactories, gasPerNativeFlush, gasPerTokenFlush, profitPerTxInEth, providers, walletClients, slippage, swapFee, relayerAccounts } from "@/config";
import { forwarderImplementations } from "@/config";
import { ForwarderABI } from "@/config/abis/Forwarder";

export type FlushParams = {
    token: string;
    amount: string;
    amountOutMinimum: string;
    swapFee: string;
    swapDeadline: string;
    sqrtPriceLimitX96: string;
    relayerFee: string;
    nonce: string;
}

export type FlushEstimate = {
    nativeOut: string;
    nativeOutMin: string;
    tokenOut: string;
    tokenOutMin: string;
    relayerFee: string;
    deployed: boolean;
    forwarder: string;
    enoughForFees: boolean;
}

export type FlushQuote = {
    estimate: FlushEstimate,
    params: FlushParams
}

export const quoteFlush = async ({
    chainId,
    tokenAddress,
    userAddress,
    amountDecimal,
}: {
    chainId: number;
    tokenAddress: Address;
    userAddress: Address;
    amountDecimal: string;
}): Promise<FlushQuote> => {
    if (tokenAddress === zeroAddress) {
        return quoteFlushNative({
            chainId,
            userAddress,
            amountDecimal,
        });
    } else {
        return quoteFlushTokenWithNative({
            chainId,
            tokenAddress,
            userAddress,
            amountDecimal,
        });
    }
}

export const quoteFlushTokenWithNative = async ({
    chainId,
    tokenAddress,
    userAddress,
    amountDecimal,
}: {
    chainId: number;
    tokenAddress: Address;
    userAddress: Address;
    amountDecimal: string;
}): Promise<FlushQuote> => {
    const provider = providers[chainId as number];
    const gasPrice = await provider.getGasPrice()
    const token = await getContract({ abi: erc20Abi, address: tokenAddress, client: provider })

    const forwarder = await provider.readContract({
        address: forwarderFactories[chainId],
        abi: ForwarderFactoryABI,
        functionName: 'getForwarder',
        args: [userAddress],
    }) as Address;

    // ensure enough balance for withdrawal
    const tokenDecimals = await token.read.decimals();
    const nativeDecimals = provider.chain?.nativeCurrency.decimals || 18
    const amount = parseUnits(amountDecimal, tokenDecimals);
    const balance = await token.read.balanceOf([forwarder]);

    if (balance < amount) {
        throw new Error("Insufficient balance");
    }

    // calculate deployment cost
    const isDeployed = await provider.getCode({
        address: forwarder,
    }).then((code) => !!code);

    // make estmations
    let deploymentCost = BigInt(0);
    if (!isDeployed) {
        deploymentCost = BigInt(await provider.estimateContractGas({
            abi: ForwarderFactoryABI,
            address: forwarderFactories[chainId],
            functionName: 'createForwarder',
            args: [userAddress],
            account: walletClients[chainId].account,
        }) * gasPrice);
    }
    const eth = await provider.readContract({
        address: forwarderImplementations[chainId],
        abi: ForwarderABI,
        functionName: "quoteSwapForNative",
        args: [tokenAddress, amount, swapFee, 0]
    }) as bigint;

    const withdrawalFee = gasPerTokenFlush[chainId as number] * gasPrice;
    const relayerFee = deploymentCost + withdrawalFee + profitPerTxInEth[chainId as number];
    const nativeOut = eth - relayerFee;
    const nativeOutMin = nativeOut * slippage / 100n;
    const tokenOut = balance - amount;

    return {
        estimate: {
            nativeOut: formatUnits(nativeOut, nativeDecimals),
            nativeOutMin: formatUnits(nativeOutMin, nativeDecimals),
            tokenOut: formatUnits(tokenOut, tokenDecimals),
            tokenOutMin: formatUnits(tokenOut, tokenDecimals),
            relayerFee: formatUnits(relayerFee, nativeDecimals),
            deployed: isDeployed,
            forwarder: forwarder,
            enoughForFees: true,
        },
        params: {
            token: tokenAddress,
            amount: amount.toString(),
            amountOutMinimum: nativeOutMin.toString(),
            swapFee: swapFee.toString(),
            swapDeadline: BigInt(Date.now() + 1000 * 60 * 60 * 24).toString(), // TODO:
            sqrtPriceLimitX96: 0n.toString(),
            relayerFee: relayerFee.toString(),
            nonce: isDeployed ? (await getNonce(chainId, forwarder)).toString() : "0"
        }
    }
}

export const quoteFlushNative = async ({
    chainId,
    userAddress,
    amountDecimal,
}: {
    chainId: number;
    userAddress: Address;
    amountDecimal: string;
}): Promise<FlushQuote> => {
    const provider = providers[chainId as number];
    const gasPrice = await provider.getGasPrice()

    const forwarder = await provider.readContract({
        address: forwarderFactories[chainId],
        abi: ForwarderFactoryABI,
        functionName: 'getForwarder',
        args: [userAddress],
    }) as Address;

    // ensure enough balance for withdrawal
    const nativeDecimals = provider.chain?.nativeCurrency.decimals || 18
    const amount = parseUnits(amountDecimal, nativeDecimals);
    const balance = await provider.getBalance({ address: forwarder });

    if (balance < amount) {
        throw new Error("Insufficient balance");
    }

    // calculate deployment cost
    const isDeployed = await provider.getCode({
        address: forwarder,
    }).then((code) => !!code);

    // make estmations
    let deploymentCost = BigInt(0);
    if (!isDeployed) {
        deploymentCost = BigInt(await provider.estimateContractGas({
            abi: ForwarderFactoryABI,
            address: forwarderFactories[chainId],
            functionName: 'createForwarder',
            args: [userAddress],
            account: walletClients[chainId].account,
        }) * gasPrice);
    }

    const withdrawalFee = gasPerNativeFlush[chainId as number] * gasPrice;
    const relayerFee = deploymentCost + withdrawalFee + profitPerTxInEth[chainId as number];

    return {
        estimate: {
            nativeOut: formatUnits(amount, nativeDecimals),
            nativeOutMin: formatUnits(amount, nativeDecimals),
            tokenOut: "0",
            tokenOutMin: "0",
            relayerFee: formatUnits(relayerFee, nativeDecimals),
            deployed: isDeployed,
            forwarder: forwarder,
            enoughForFees: balance >= amount + relayerFee,
        },
        params: {
            token: zeroAddress,
            amount: amount.toString(),
            amountOutMinimum: amount.toString(),
            swapFee: swapFee.toString(),
            swapDeadline: BigInt(Date.now() + 1000 * 60 * 60 * 24).toString(), // TODO:
            sqrtPriceLimitX96: 0n.toString(),
            relayerFee: relayerFee.toString(),
            nonce: isDeployed ? (await getNonce(chainId, forwarder)).toString() : "0"
        }
    }
}

export const deployForwarder = ({
    chainId,
    userAddress,
}: {
    chainId: number;
    userAddress: Address;
}) => {
    const provider = providers[chainId];
    const client = walletClients[chainId];
    const relayer = relayerAccounts[chainId];

    console.log("writeContract", {
        account: relayer,
        privateKey: process.env.RELAYER_KEY!,
        address: forwarderFactories[chainId],
        abi: ForwarderFactoryABI.find((abi) => abi.name === "getForwarder") as any,
        functionName: 'createForwarder',
        args: [userAddress],
    })

    // create forwarder for user
    return provider.simulateContract({
        account: relayer,
        address: forwarderFactories[chainId],
        abi: ForwarderFactoryABI,
        functionName: 'createForwarder',
        args: [userAddress],
    }).then(({ request }) => client.writeContract(request))
        .then(hash => provider.waitForTransactionReceipt({ hash }))
        .then((r) => r.status === "success")
}

export const getForwarder = async (chainId: number, userAddress: Address) => {
    const provider = providers[chainId as number];

    return provider.readContract({
        address: forwarderFactories[chainId],
        abi: ForwarderFactoryABI,
        functionName: 'getForwarder',
        args: [userAddress],
    }) as Promise<Address>
}

export const flushTokenWithNative = async (chainId: number, user: Address, params: FlushParams, signature: string) => {
    const provider = providers[chainId];
    const client = walletClients[chainId];
    const relayer = relayerAccounts[chainId];

    // withdraw with native
    return provider.simulateContract({
        account: relayer,
        address: await getForwarder(chainId, user),
        abi: ForwarderABI,
        functionName: 'flushTokenWithNative',
        args: [{
            token: params.token,
            amount: params.amount,
            amountOutMinimum: params.amountOutMinimum,
            swapFee: params.swapFee,
            swapDeadline: params.swapDeadline,
            sqrtPriceLimitX96: params.sqrtPriceLimitX96,
            relayerFee: params.relayerFee,
        }, signature],
    }).then(({ request }) => client.writeContract(request))
}

export const flushNative = async (chainId: number, user: Address, params: FlushParams, signature: string) => {
    const provider = providers[chainId as number];
    const client = walletClients[chainId];
    const relayer = relayerAccounts[chainId];

    // withdraw with native
    return provider.simulateContract({
        account: relayer,
        address: await getForwarder(chainId, user),
        abi: ForwarderABI,
        functionName: 'flushNative',
        args: [{
            token: params.token,
            amount: params.amount,
            amountOutMinimum: params.amountOutMinimum,
            swapFee: params.swapFee,
            swapDeadline: params.swapDeadline,
            sqrtPriceLimitX96: params.sqrtPriceLimitX96,
            relayerFee: params.relayerFee,
        }, signature],
    }).then(({ request }) => client.writeContract(request))
}

export const getUserForwarder = async (chainId: number, userAddress: Address): Promise<string> => {
    const provider = providers[chainId as number];

    return provider.readContract({
        address: forwarderFactories[chainId],
        abi: ForwarderFactoryABI,
        functionName: 'getForwarder',
        args: [userAddress],
    }) as Promise<string>;
}

export const getNonce = async (chainId: number, forwarder: Address): Promise<string> => {
    const provider = providers[chainId as number];

    return provider.readContract({
        address: forwarder,
        abi: ForwarderABI,
        functionName: 'getNonce',
        args: [],
    }) as Promise<string>;
}