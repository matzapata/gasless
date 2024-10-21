import type { NextApiRequest, NextApiResponse } from "next";
import { getUserForwarder } from "@/pkg/forwarder";

type Data = {
    forwarder?: string;
    error?: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>,
) {
    const { userAddress, chainId } = req.query;

    // validations
    if (!userAddress || typeof userAddress !== "string" || !userAddress.startsWith("0x")) {
        return res.status(400).json({ error: "Invalid request" });
    }

    try {
        const userForwarder = await getUserForwarder({
            chainId: Number(chainId),
            userAddress: userAddress as `0x${string}`,
        });

        res.status(200).json({ forwarder: userForwarder });
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
}
