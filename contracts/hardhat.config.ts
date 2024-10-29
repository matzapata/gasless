import "@nomicfoundation/hardhat-toolbox";
import '@openzeppelin/hardhat-upgrades';
import "@nomicfoundation/hardhat-verify";


import { HardhatUserConfig } from "hardhat/config";
import { EnvVar, useEnv } from "./common/env";
import { networkConfig } from "./common/config";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      chainId: Number(useEnv(EnvVar.CHAIN_ID)),
      forking: {
        blockNumber: Number(useEnv(EnvVar.FORK_BLOCK)),
        url: networkConfig[Number(useEnv(EnvVar.CHAIN_ID))].RPC_URL,
      },
    },
    optimism: {
      url: networkConfig[10].RPC_URL,
      accounts: [useEnv(EnvVar.PRIVATE_KEY)],
    },
    polygon: {
      url: networkConfig[137].RPC_URL,
      accounts: [useEnv(EnvVar.PRIVATE_KEY)],
    }
  },
  etherscan: {
    apiKey: {
      polygon: useEnv(EnvVar.POLYGONSCAN_API_KEY),
      optimisticEthereum: useEnv(EnvVar.OPTIMISTIC_API_KEY),
    }
  }
};

export default config;
