import { ethers, upgrades } from "hardhat";
import { EnvVar, useEnv } from "../../common/env";
import { buildDeploymentPath } from "../utils/build-deployment-path";

async function main () {
  const chainId = Number(useEnv(EnvVar.CHAIN_ID))

  const proxyAddress = require(buildDeploymentPath(chainId, 'ForwarderFactory')).address;
  
  const ForwarderFactory = await ethers.getContractFactory('ForwarderFactory');
  const forwarderFactory = await upgrades.upgradeProxy(proxyAddress, ForwarderFactory);
  await forwarderFactory.waitForDeployment();
  console.log('ForwarderFactory deployed to:', await forwarderFactory.getAddress());
}

main();

