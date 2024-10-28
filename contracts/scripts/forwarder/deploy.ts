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
    `npx hardhat verify --network polygon ${forwarderFactoryAddress} 0xE592427A0AEce92De3Edee1F18E0157C05861564 0x5e55c9e631fae526cd4b0526c4818d6e0a9ef0e3 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270`
  )

  fs.writeFileSync(buildDeploymentPath(chainId, 'ForwarderFactory'), JSON.stringify({ address: await forwarderFactory.getAddress() }, null, 2));


}

main();
