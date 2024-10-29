import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

export const useForwarder = () => {
  const account = useAccount();

  return useQuery({
    queryKey: ["forwarder", account.address, account.chainId],
    queryFn: () =>
      fetch(
        `/api/deposit?userAddress=${account.address}&chainId=${account.chainId}`
      )
        .then((res) => res.json())
        .then((res) => res.forwarder),
    enabled: !!account.address && !!account.chainId,
  });
};
