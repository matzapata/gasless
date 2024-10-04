import { ethers, upgrades } from "hardhat";
import { EnvVar, useEnv } from "../common/env";
import { networkConfig } from "../common/config";

const PROXY_ADDRESS = require("../deployments/ThisForThat.json").address;

async function main () {
  const chainId = Number(useEnv(EnvVar.CHAIN_ID))
  const config = networkConfig[chainId];
  
  const ThisForThat = await ethers.getContractFactory('ThisForThat');
  const thisForThat = await upgrades.upgradeProxy(PROXY_ADDRESS, ThisForThat, {
    constructorArgs: [
      config.UNISWAP_ROUTER,
      config.UNISWAP_QUOTER,
      config.UNISWAP_WETH,
      config.TOKENS.map(t => t.address),
      config.FEE
    ],
  });
  await thisForThat.waitForDeployment();
  console.log('ThisForThat deployed to:', await thisForThat.getAddress());
}

main();

