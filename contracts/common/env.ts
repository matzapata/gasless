import "dotenv/config";

export enum EnvVar {
    CHAIN_ID = "CHAIN_ID",
    FORK_BLOCK = "FORK_BLOCK",
    OPT_RPC_URL = "OPT_RPC_URL",
    POLYGON_RPC_URL = "POLYGON_RPC_URL",
    PRIVATE_KEY = "PRIVATE_KEY",
    POLYGONSCAN_API_KEY = "POLYGONSCAN_API_KEY",
    OPTIMISTIC_API_KEY = "OPTIMISTIC_API_KEY",
}

export const useEnv = (key: EnvVar): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing ${key} in .env`);
    }
    return value;
}
