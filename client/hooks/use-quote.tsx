import { FlushQuote } from "@/lib/forwarder";
import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";
import { useAccount } from "wagmi";

export const useQuote = (token: Address, amount: string) => {
  const account = useAccount();

  const { data: quote, isPending } = useQuery({
    queryKey: [account.address, token, amount],
    queryFn: () =>
      fetch(
        `/api/estimate?user=${account.address}&token=${token}&amount=${amount}&chain=${account.chainId}`
      ).then((res) => res.json() as Promise<FlushQuote & { error?: string }>),
    enabled: !(amount === "" || Number(amount) <= 0 || !account.address),
  });

  return { quote, isPending };
};
