import { ethers } from "hardhat";

const PROXY_ADDRESS = require("../deployments/GasStation.json").address;

async function main(tokenAddress: string, whitelisted: boolean) {
    const gasStation = await ethers.getContractAt("GasStation", PROXY_ADDRESS);

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