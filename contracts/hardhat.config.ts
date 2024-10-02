import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";
import { EnvVar, useEnv } from "./common/env";
import { networkConfig } from "./common/config";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      chainId: Number(useEnv(EnvVar.FORK_CHAIN_ID)),
      forking: {
        blockNumber: Number(useEnv(EnvVar.FORK_BLOCK)),
        url: networkConfig[Number(useEnv(EnvVar.FORK_CHAIN_ID))].RPC_URL,
      },
    }
  }
};

export default config;
