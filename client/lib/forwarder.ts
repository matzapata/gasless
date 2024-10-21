import { ForwarderFactoryABI } from "@/config/abis/ForwarderFactory";
import { erc20Abi, getContract } from "viem";
import { forwarderFactories, gasPerWithdrawal, profitPerTxInEth, providers, relayerAccounts } from "./config";
import { forwarderImplementations } from "@/config";
import { ForwarderABI } from "@/config/abis/Forwarder";

export const quoteFlushTokenWithNative = async ({
    chainId,
    tokenAddress,
    userAddress,
    forwarderAddress,
    amountDecimal,
}: {
    chainId: number;
    tokenAddress: `0x${string}`;
    userAddress: `0x${string}`;
    forwarderAddress: `0x${string}`;
    amountDecimal: string;
}) => {
    const provider = providers[chainId as number];
    const gasPrice = await provider.getGasPrice()
    const token = await getContract({ abi: erc20Abi, address: tokenAddress, client: provider })
    const forwarderImplementation = await getContract({ abi: ForwarderABI, address: forwarderImplementations[chainId], client: provider })

    // ensure enough balance for withdrawal
    const tokenDecimals = await token.read.decimals();
    const amount = BigInt(amountDecimal) * 10n ** BigInt(tokenDecimals);
    const balance = await token.read.balanceOf([forwarderAddress as `0x${string}`]);

    if (balance < amount) {
        throw new Error("Insufficient balance");
    }

    // calculate deployment cost
    const isDeployed = await provider.getCode({
        address: forwarderAddress as `0x${string}`,
    }).then((code) => code !== "0x");

    // make estmations
    let deploymentCost = BigInt(0);
    if (!isDeployed) {
        deploymentCost = await provider.estimateContractGas({
            abi: ForwarderFactoryABI,
            address: forwarderFactories[chainId],
            functionName: 'createForwarder',
            args: [userAddress],
        }) * gasPrice;
    }
    const eth = await forwarderImplementation.read.quoteSwapForNative(
        [tokenAddress, amount, 3000n, 0],
    ) as bigint;

    const withdrawalFee = gasPerWithdrawal[chainId as number] * gasPrice;
    const relayerFee = deploymentCost + withdrawalFee + profitPerTxInEth[chainId as number];
    const ethOut = eth - relayerFee;
    const tokenOut = balance - amount;

    return {
        ethOut,
        tokenIn: amount,
        tokenOut,
        tokenDecimals,
        relayerFee,
        deploymentCost,
    }
}

export const deployForwarder = ({
    chainId,
    userAddress,
}: {
    chainId: number;
    userAddress: `0x${string}`;
}) => {
    const provider = providers[chainId as number];
    const relayer = relayerAccounts[chainId as number];

    // create forwarder for user
    return provider.simulateContract({
        account: relayer.account,
        address: forwarderFactories[chainId],
        abi: ForwarderFactoryABI,
        functionName: 'createForwarder',
        args: [userAddress],
    }).then(({ request }) => relayer.writeContract(request))
}

export const flushTokenWithNative = async ({
    chainId,
    token,
    amount,
    forwarderAddress,
}: {
    chainId: number;
    token: `0x${string}`;
    amount: bigint;
    forwarderAddress: `0x${string}`;
}) => {
    const provider = providers[chainId as number];
    const relayer = relayerAccounts[chainId as number];

    // withdraw with native
    return provider.simulateContract({
        account: relayer.account,
        address: forwarderAddress,
        abi: ForwarderABI,
        functionName: 'flushTokenWithNative',
        args: [token, amount, 3000n, 0],
    }).then(({ request }) => relayer.writeContract(request))
}

export const getUserForwarder = async ({
    chainId,
    userAddress,
}: {
    chainId: number;
    userAddress: `0x${string}`;
}): Promise<string> => {
    const provider = providers[chainId as number];

    return provider.readContract({
        address: forwarderFactories[chainId],
        abi: ForwarderFactoryABI,
        functionName: 'getForwarder',
        args: [userAddress],
    }) as Promise<string>; // TODO:
}