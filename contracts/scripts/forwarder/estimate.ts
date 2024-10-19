import hre from 'hardhat';
import { EnvVar, useEnv } from '../../common/env';
import { buildDeploymentPath } from '../utils/build-deployment-path';

const CHAIN_ID = Number(useEnv(EnvVar.CHAIN_ID))
const FORWARDER_FACTORY_ADDRESS = require(buildDeploymentPath(CHAIN_ID, 'ForwarderFactory')).address;

async function isDeployed(address: string) {
    const code = await hre.ethers.provider.getCode(address);
    return code !== '0x';
}

async function estimate(
    user: string,
    token: string,
    sellForEth: bigint
) {
    const forwarderFactory = await hre.ethers.getContractAt("ForwarderFactory", FORWARDER_FACTORY_ADDRESS)

    const forwarderAddress = await forwarderFactory.getForwarder(user);
    console.log("forwarder:", forwarderAddress);

    const deployed = await isDeployed(forwarderAddress);
    console.log("forwarder deployed:", deployed);

    // gas estimation for withdrawal
    const gasPrice = (await hre.ethers.provider.getFeeData()).gasPrice ?? BigInt(0);
    if (deployed) {
        const forwarder = await hre.ethers.getContractAt("Forwarder", forwarderAddress)
        const ethOut = await forwarder.quoteSwapForNative(
            token,
            sellForEth,
            3000n,
            0
        )
        console.log("ETH Out:", hre.ethers.formatEther(ethOut))

        // TODO:
    } else {
        const deploymentGas = await forwarderFactory.createForwarder.estimateGas(user)
        console.log("deploymentGas:", hre.ethers.formatEther(gasPrice * deploymentGas))
       
        const forwarderImplementation = await hre.ethers.getContractAt(
            "Forwarder",
            await forwarderFactory.implementation()
        )
        const ethOut = await forwarderImplementation.quoteSwapForNative(
            token,
            sellForEth,
            3000n,
            0
        )
        console.log("ETH Out:", hre.ethers.formatEther(ethOut))
    }
}

estimate(
    "0xF754D0f4de0e815b391D997Eeec5cD07E59858F0",
    "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    100000n
)

