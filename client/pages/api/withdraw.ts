import { ForwarderFactoryABI } from "@/config/abis/ForwarderFactory";
import type { NextApiRequest, NextApiResponse } from "next";
import { erc20Abi, getContract } from "viem";

type Data = {
  tx?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const { forwarder, token, amount } = req.body;

  if (!forwarder || !token || !amount) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  // TODO: check contract has token desired
  const erc20 = await getContract({
    abi: erc20Abi,
    address: token,
    client: ,
  })

  // TODO: check if forwarder is deployed
    // TODO: deploy forwarder

  // simulate tx

  // call tx

  // const forwarder = await getContract({
  //   abi: ForwarderFactoryABI
  // })


  res.status(200).json({ tx: "John Doe" });
}
