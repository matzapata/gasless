import { deployForwarder, quoteFlushTokenWithNative, flushTokenWithNative } from "@/lib/forwarder";
import { NextRequest } from "next/server";


export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userAddress, chainId, tokenAddress, amountDecimal } = body;

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

  const estimate = await quoteFlushTokenWithNative({
    chainId,
    tokenAddress: tokenAddress as `0x${string}`,
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
    forwarderAddress: estimate.userForwarder,
  });

  return Response.json({ deployTx, withdrawTx });
}
