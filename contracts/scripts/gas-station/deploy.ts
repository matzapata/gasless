import { ethers, upgrades } from "hardhat";
import { networkConfig } from "../../common/config";
import { EnvVar, useEnv } from "../../common/env";
import * as fs from 'fs';
import { buildDeploymentPath } from "../utils/build-deployment-path";

async function main() {
  const chainId = Number(useEnv(EnvVar.CHAIN_ID))
  const config = networkConfig[chainId];

  const GasStation = await ethers.getContractFactory('GasStation');
  const gasStation = await upgrades.deployProxy(GasStation, [
    config.UNISWAP_ROUTER,
    config.UNISWAP_QUOTER,
    config.UNISWAP_WETH,
    config.TOKENS.map(t => t.address),
    config.RElAYER_FEE,
    config.SWAP_FEE
  ], {
    initializer: 'initialize',
  });
  await gasStation.waitForDeployment();
  console.log('GasStation deployed to:', await gasStation.getAddress());

  fs.writeFileSync(buildDeploymentPath(chainId, 'GasStation'), JSON.stringify({ address: await gasStation.getAddress() }, null, 2));
}

main();
