import type { NextApiRequest, NextApiResponse } from "next";
import { quoteFlushTokenWithNative } from "@/lib/forwarder";
import { formatEther, formatUnits } from "viem";

type Data = {
  ethOut?: string;
  tokenOut?: string;
  relayerFee?: string;
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

  try {
    const estimate = await quoteFlushTokenWithNative({
      chainId: Number(chainId),
      tokenAddress: tokenAddress as `0x${string}`,
      forwarderAddress: forwarderAddress as `0x${string}`,
      userAddress: userAddress as `0x${string}`,
      amountDecimal: amountDecimal.toString(),
    });

    res.status(200).json({
      ethOut: formatEther(estimate.ethOut),
      tokenOut: formatUnits(estimate.tokenOut, estimate.tokenDecimals),
      relayerFee: formatEther(estimate.relayerFee),
    });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
}
