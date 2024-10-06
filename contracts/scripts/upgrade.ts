import { ethers, upgrades } from "hardhat";
import { EnvVar, useEnv } from "../common/env";
import { networkConfig } from "../common/config";

const PROXY_ADDRESS = require("../deployments/GasStation.json").address;

async function main () {
  const chainId = Number(useEnv(EnvVar.CHAIN_ID))
  const config = networkConfig[chainId];
  
  const GasStation = await ethers.getContractFactory('GasStation');
  const gasStation = await upgrades.upgradeProxy(PROXY_ADDRESS, GasStation, {
    constructorArgs: [
      config.UNISWAP_ROUTER,
      config.UNISWAP_QUOTER,
      config.UNISWAP_WETH,
      config.TOKENS.map(t => t.address),
      config.RElAYER_FEE,
      config.SWAP_FEE
    ],
  });
  await gasStation.waitForDeployment();
  console.log('GasStation deployed to:', await gasStation.getAddress());
}

main();

