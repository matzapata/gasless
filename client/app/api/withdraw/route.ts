import { deployForwarder, flushTokenWithNative, flushNative, FlushQuote } from "@/lib/forwarder";
import { NextRequest } from "next/server";
import { Address, zeroAddress } from "viem";


export async function POST(req: NextRequest) {
  const body = await req.json();
  const chainId = Number(body.chainId);
  const userAddress = body.user as Address;
  const signature = body.signature;
  const quote = body.quote as FlushQuote;

  // validations
  if (!userAddress || typeof userAddress !== "string" || !userAddress.startsWith("0x")) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  } else if (!chainId || typeof chainId !== "number") {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  } else if (!quote) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (quote.estimate.enoughForFees === false) {
    return Response.json({ error: "Not enough funds" }, { status: 400 });
  }

  let withdrawTx: string | undefined;

  console.log("quote", quote)

  try {
    console.log("withdraw")
    if (quote.estimate.deployed === false) {
      const success = await deployForwarder({ chainId, userAddress });

      if (!success) {
        return Response.json({ error: "Failed to deploy forwarder" }, { status: 400 });
      }
    }

    withdrawTx = quote.params.token === zeroAddress ?
      await flushNative(chainId, userAddress, quote.params, signature)
      : await flushTokenWithNative(chainId, userAddress, quote.params, signature);

    return Response.json({ withdrawTx });
  } catch (e) {
    return Response.json({ withdrawTx, error: e instanceof Error ? e.message : "Unknown error" }, { status: 400 });
  }

}
