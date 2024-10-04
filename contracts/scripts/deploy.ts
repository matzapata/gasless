import { ethers, upgrades } from "hardhat";
import { networkConfig } from "../common/config";
import { EnvVar, useEnv } from "../common/env";
import * as fs from 'fs';

async function main() {
  const chainId = Number(useEnv(EnvVar.CHAIN_ID))
  const config = networkConfig[chainId];


  const ThisForThat = await ethers.getContractFactory('ThisForThat');
  const thisForThat = await upgrades.deployProxy(ThisForThat, {
    constructorArgs: [
      config.UNISWAP_ROUTER,
      config.UNISWAP_QUOTER,
      config.UNISWAP_WETH,
      config.TOKENS.map(t => t.address),
      config.FEE
    ]
  });
  await thisForThat.waitForDeployment();
  console.log('ThisForThat deployed to:', await thisForThat.getAddress());

  fs.writeFileSync("../deployments/ThisForThat.json", JSON.stringify({ address: thisForThat.address }, null, 2));
}

main();
