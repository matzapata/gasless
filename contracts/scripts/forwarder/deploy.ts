import * as fs from 'fs';
import { ethers } from "hardhat";
import { networkConfig } from "../../common/config";
import { EnvVar, useEnv } from "../../common/env";
import { buildDeploymentPath } from "../utils/build-deployment-path";

async function main() {
  const chainId = Number(useEnv(EnvVar.CHAIN_ID))
  const config = networkConfig[chainId];

  const ForwarderFactory = await ethers.getContractFactory('ForwarderFactory');
  const forwarderFactory = await ForwarderFactory.deploy(
    config.UNISWAP_ROUTER,
    config.UNISWAP_QUOTER,
    config.UNISWAP_WETH
  );
  await forwarderFactory.waitForDeployment();
  const forwarderFactoryAddress = await forwarderFactory.getAddress();

  console.log('Forwarder factory deployed to:', forwarderFactoryAddress);
  console.log(
    "Verify with:",
    `npx hardhat verify ${forwarderFactoryAddress} ${config.UNISWAP_ROUTER} ${config.UNISWAP_QUOTER} ${config.UNISWAP_WETH} --network ${config.NAME}`
  )

  fs.writeFileSync(buildDeploymentPath(chainId, 'ForwarderFactory'), JSON.stringify({ address: await forwarderFactory.getAddress() }, null, 2));


}

main();
