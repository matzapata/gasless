import { ethers, upgrades } from "hardhat";
import { networkConfig } from "../common/config";
import { EnvVar, useEnv } from "../common/env";
import * as fs from 'fs';

async function main() {
  const chainId = Number(useEnv(EnvVar.CHAIN_ID))
  const config = networkConfig[chainId];


  const GasStation = await ethers.getContractFactory('GasStation');
  const gasStation = await upgrades.deployProxy(GasStation, {
    constructorArgs: [
      config.UNISWAP_ROUTER,
      config.UNISWAP_QUOTER,
      config.UNISWAP_WETH,
      config.TOKENS.map(t => t.address),
      config.RElAYER_FEE,
      config.SWAP_FEE
    ]
  });
  await gasStation.waitForDeployment();
  console.log('GasStation deployed to:', await gasStation.getAddress());

  fs.writeFileSync("../deployments/GasStation.json", JSON.stringify({ address: gasStation.address }, null, 2));
}

main();
