
const FORWARDER_FACTORIES: {
    [chainId: number]: `0x${string}`
} = {
    137: "0x8eAe8c7840d5F0D0646c9c07758c8E742b452a30"
};

export const getForwarderFactory = (chainId: number) => {
    return FORWARDER_FACTORIES[chainId];
}