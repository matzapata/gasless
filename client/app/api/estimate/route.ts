import { quoteFlushTokenWithNative } from "@/lib/forwarder";
import { formatEther, formatUnits } from "viem";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const userAddress = searchParams.get("user")
  const tokenAddress = searchParams.get("token")
  const amountDecimal = searchParams.get("amount")
  const chainId = Number(searchParams.get("chain"))

  // validations
  if (!userAddress || typeof userAddress !== "string" || !userAddress.startsWith("0x")) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  } else if (!chainId || typeof chainId !== "number") {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  } else if (!tokenAddress || typeof tokenAddress !== "string" || !tokenAddress.startsWith("0x")) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  } else if (!amountDecimal || typeof amountDecimal !== "string") {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  // TODO: check if token is native or not

  try {
    const estimate = await quoteFlushTokenWithNative({
      chainId: Number(chainId),
      tokenAddress: tokenAddress as `0x${string}`,
      userAddress: userAddress as `0x${string}`,
      amountDecimal: amountDecimal,
    });

    return Response.json({
      ethOut: formatEther(estimate.ethOut),
      ethOutMin: formatEther(estimate.ethOut * 97n / 100n),
      tokenOut: formatUnits(estimate.tokenOut, estimate.tokenDecimals),
      relayerFee: formatEther(estimate.relayerFee),
    }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
