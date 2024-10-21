import type { NextApiRequest, NextApiResponse } from "next";
import { deployForwarder, quoteFlushTokenWithNative, flushTokenWithNative } from "@/lib/forwarder";

type Data = {
  deployTx?: string;
  withdrawTx?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const { forwarderAddress, userAddress, tokenAddress, amountDecimal, chainId } = req.body;

  // validations
  if (!forwarderAddress || typeof forwarderAddress !== "string" || !forwarderAddress.startsWith("0x")) {
    return res.status(400).json({ error: "Invalid request" });
  }

// TODO: check if token is native or not

  const estimate = await quoteFlushTokenWithNative({
    chainId,
    tokenAddress: tokenAddress as `0x${string}`,
    forwarderAddress: forwarderAddress as `0x${string}`,
    userAddress: userAddress as `0x${string}`,
    amountDecimal: amountDecimal.toString(),
  });

  let deployTx: string | undefined;
  if (estimate.deploymentCost > 0) {
    deployTx = await deployForwarder({ chainId, userAddress: userAddress as `0x${string}` });
  }

  // withdraw with native
  const withdrawTx = await flushTokenWithNative({
    chainId,
    token: tokenAddress as `0x${string}`,
    amount: estimate.tokenIn,
    forwarderAddress: forwarderAddress as `0x${string}`,
  });

  res.status(200).json({ deployTx, withdrawTx });
}
