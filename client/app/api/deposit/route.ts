import { getUserForwarder } from "@/lib/forwarder";
import { type NextRequest } from 'next/server'


export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const userAddress = searchParams.get("userAddress")
    const chainId = searchParams.get("chainId")

    // validations
    if (!userAddress || typeof userAddress !== "string" || !userAddress.startsWith("0x")) {
        return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    try {
        const userForwarder = await getUserForwarder({
            chainId: Number(chainId),
            userAddress: userAddress as `0x${string}`,
        });

        return Response.json({ forwarder: userForwarder });
    } catch (error) {
        return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
    }
}
