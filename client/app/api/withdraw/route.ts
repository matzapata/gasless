import { deployForwarder, quoteFlushTokenWithNative, flushTokenWithNative, quoteFlush, flushNative } from "@/lib/forwarder";
import { NextRequest } from "next/server";
import { Address, zeroAddress } from "viem";


export async function POST(req: NextRequest) {
  const body = await req.json();
  const chainId = Number(body.chainId);
  const amountDecimal = body.amountDecimal;
  const userAddress = body.userAddress as Address;
  const tokenAddress = body.tokenAddress as Address;
  const signature = body.signature;

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

  const { estimate, params } = await quoteFlush({
    chainId,
    tokenAddress,
    userAddress,
    amountDecimal,
  });

  if (estimate.enoughForFees === false) {
    return Response.json({ error: "Not enough funds" }, { status: 400 });
  }

  let deployTx: string | undefined;
  let withdrawTx: string | undefined;

  try {
    if (estimate.deployed === false) {
      deployTx = await deployForwarder({ chainId, userAddress });
    }

    withdrawTx = tokenAddress === zeroAddress ?
      await flushNative(chainId, userAddress, params, signature)
      : await flushTokenWithNative(chainId, userAddress, params, signature);

    return Response.json({ deployTx, withdrawTx });
  } catch (e) {
    return Response.json({ deployTx, withdrawTx, error: e instanceof Error ? e.message : "Unknown error" }, { status: 400 });
  }

}
