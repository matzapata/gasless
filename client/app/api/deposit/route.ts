import { getUserForwarder } from "@/lib/forwarder";
import { type NextRequest } from 'next/server'
import { Address } from "viem";


export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const chainId = searchParams.get("chainId")
    const userAddress = searchParams.get("userAddress") as Address;

    // validations
    if (!userAddress || typeof userAddress !== "string" || !userAddress.startsWith("0x")) {
        return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    try {
        const forwarder = await getUserForwarder(Number(chainId), userAddress);

        return Response.json({ forwarder });
    } catch (error) {
        return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
    }
}
