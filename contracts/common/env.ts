import "dotenv/config";

export enum EnvVar {
    FORK_BLOCK = "FORK_BLOCK",
    FORK_CHAIN_ID = "FORK_CHAIN_ID",
    OPT_RPC_URL = "OPT_RPC_URL",
}

export const useEnv = (key: EnvVar): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing ${key} in .env`);
    }
    return value;
}
