import { ethers, upgrades } from "hardhat";
import { EnvVar, useEnv } from "../../common/env";
import { buildDeploymentPath } from "../utils/build-deployment-path";


async function main () {
  const chainId = Number(useEnv(EnvVar.CHAIN_ID))
  
  const proxyAddress = require(buildDeploymentPath(chainId, 'GasStation')).address;

  const GasStation = await ethers.getContractFactory('GasStation');
  const gasStation = await upgrades.upgradeProxy(proxyAddress, GasStation);
  await gasStation.waitForDeployment();
  console.log('GasStation deployed to:', await gasStation.getAddress());
}

main();

