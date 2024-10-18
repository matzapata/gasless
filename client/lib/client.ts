import { createPublicClient } from "viem";

 
export const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
  })