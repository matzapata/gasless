import { quoteFlush } from "@/lib/forwarder";
import { Address } from "viem";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const userAddress = searchParams.get("user") as Address
  const tokenAddress = searchParams.get("token") as Address
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

  try {
    return Response.json(await quoteFlush({
      chainId: chainId,
      tokenAddress: tokenAddress,
      userAddress: userAddress,
      amountDecimal: amountDecimal,
    }), { status: 200 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
