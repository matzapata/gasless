import { ForwarderFactoryABI } from "@/config/abis/ForwarderFactory";
import { erc20Abi, formatEther, getContract, parseUnits } from "viem";
import { forwarderFactories, gasPerWithdrawal, profitPerTxInEth, providers, relayerAccounts, slippage, swapFee } from "@/config";
import { forwarderImplementations } from "@/config";
import { ForwarderABI } from "@/config/abis/Forwarder";

export const quoteFlushTokenWithNative = async ({
    chainId,
    tokenAddress,
    userAddress,
    amountDecimal,
}: {
    chainId: number;
    tokenAddress: `0x${string}`;
    userAddress: `0x${string}`;
    amountDecimal: string;
}) => {
    const provider = providers[chainId as number];
    const gasPrice = await provider.getGasPrice()
    const token = await getContract({ abi: erc20Abi, address: tokenAddress, client: provider })

    const userForwarder = await provider.readContract({
        address: forwarderFactories[chainId],
        abi: ForwarderFactoryABI,
        functionName: 'getForwarder',
        args: [userAddress],
    }) as `0x${string}`;

    // ensure enough balance for withdrawal
    const tokenDecimals = await token.read.decimals();
    const amount = parseUnits(amountDecimal, tokenDecimals);
    const balance = await token.read.balanceOf([userForwarder]);

    if (balance < amount) {
        throw new Error("Insufficient balance");
    }

    // calculate deployment cost
    const isDeployed = await provider.getCode({
        address: userForwarder,
    }).then((code) => code !== "0x");

    // make estmations
    let deploymentCost = BigInt(0);
    if (!isDeployed) {
        deploymentCost = BigInt(await provider.estimateContractGas({
            abi: ForwarderFactoryABI,
            address: forwarderFactories[chainId],
            functionName: 'createForwarder',
            args: [userAddress],
            account: relayerAccounts[chainId].account,
        }) * gasPrice);
    }
    const eth = await provider.readContract({
        address: forwarderImplementations[chainId],
        abi: ForwarderABI,
        functionName: "quoteSwapForNative",
        args: [tokenAddress, amount, swapFee, 0]
    }) as bigint;

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
        userForwarder,
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
        args: [token, amount, amount * slippage, swapFee, 0],
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
    }) as Promise<string>; 
}