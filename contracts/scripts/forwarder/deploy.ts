import { ethers, upgrades } from "hardhat";
import { networkConfig } from "../../common/config";
import { EnvVar, useEnv } from "../../common/env";
import * as fs from 'fs';
import { buildDeploymentPath } from "../utils/build-deployment-path";

async function main() {
  const chainId = Number(useEnv(EnvVar.CHAIN_ID))
  const config = networkConfig[chainId];

  const gasStation = require(buildDeploymentPath(chainId, 'GasStation')).address;

  const ForwarderFactory = await ethers.getContractFactory('ForwarderFactory');
  const forwarderFactory = await upgrades.deployProxy(ForwarderFactory, [
    gasStation,
    config.UNISWAP_WETH,
    config.UNISWAP_ROUTER
  ], {
    initializer: "initialize",
  });
  await forwarderFactory.waitForDeployment();
  console.log('Forwarder factory deployed to:', await forwarderFactory.getAddress());

  fs.writeFileSync(buildDeploymentPath(chainId, 'ForwarderFactory'), JSON.stringify({ address: await forwarderFactory.getAddress() }, null, 2));
}

main();
