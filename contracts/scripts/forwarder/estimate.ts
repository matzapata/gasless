import hre from 'hardhat';
import { EnvVar, useEnv } from '../../common/env';
import { buildDeploymentPath } from '../utils/build-deployment-path';

const CHAIN_ID = Number(useEnv(EnvVar.CHAIN_ID))
const GAS_STATION_ADDRESS = require(buildDeploymentPath(CHAIN_ID, 'GasStation')).address;
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
    const gasPrice = (await hre.ethers.provider.getFeeData()).gasPrice ?? BigInt(0);

    const gasStation = await hre.ethers.getContractAt("GasStation", GAS_STATION_ADDRESS)
    const forwarderFactory = await hre.ethers.getContractAt("ForwarderFactory", FORWARDER_FACTORY_ADDRESS)

    const forwarderAddress = await forwarderFactory.getForwarder(user);
    console.log("forwarder:", forwarderAddress);

    const deployed = await isDeployed(forwarderAddress);
    console.log("forwarder deployed:", deployed);

    const deploymentGas = await forwarderFactory.createForwarder.estimateGas(user)
    console.log("deploymentGas:", hre.ethers.formatEther(gasPrice * deploymentGas))

    const [ethOut, relayerFee] = await gasStation.quoteSwapForEth(
        token,
        sellForEth
    )
    console.log("ETH Out:", hre.ethers.formatEther(ethOut))
    console.log("Max relayer fee:", hre.ethers.formatEther(relayerFee))
}

estimate(
    "0xF754D0f4de0e815b391D997Eeec5cD07E59858F0",
    "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    100000n
)

