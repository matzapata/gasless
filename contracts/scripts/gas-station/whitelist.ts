import { ethers } from "hardhat";
import { buildDeploymentPath } from "../utils/build-deployment-path";
import { EnvVar, useEnv } from "../../common/env";


async function main(tokenAddress: string, whitelisted: boolean) {
    const chainId = Number(useEnv(EnvVar.CHAIN_ID))
    const proxyAddress = require(buildDeploymentPath(chainId, 'GasStation')).address;
    
    const gasStation = await ethers.getContractAt("GasStation", proxyAddress);

    const tx = await gasStation.whitelistToken(tokenAddress, whitelisted);
    await tx.wait();
    console.log("Added token to whitelist", tokenAddress);
}

const [, , tokenAddress, whitelisted] = process.argv

main(tokenAddress, whitelisted == "true")
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })