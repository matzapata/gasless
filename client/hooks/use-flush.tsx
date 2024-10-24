import { useCallback, useState } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import { Address } from "viem";
import { FlushType } from "@/config/abis/ForwarderFactory";

export const useFlush = (forwarder: Address) => {
  const account = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const [isPending, setIsPending] = useState(false);

  const flush = useCallback(
    async (quote: any) => {
      try {
        setIsPending(true);

        const signature = await signTypedDataAsync({
          domain: {
            name: "Forwarder",
            version: "1",
            chainId: account.chainId,
            verifyingContract: forwarder,
          },
          types: { Flush: FlushType },
          primaryType: "Flush",
          message: quote.data.params,
        });

        const res = await fetch("/api/withdraw", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quote,
            chainId: account.chainId,
            signature,
            user: account.address,
          }),
        }).then((res) => res.json());

        if (!res.withdrawTx) {
          throw new Error("Something went wrong");
        }
      } catch {
        setIsPending(false);
        throw new Error("Something went wrong");
      }
    },
    [forwarder]
  );

  return { flush, isPending };
};
