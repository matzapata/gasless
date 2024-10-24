import { ERC20_ABI } from "@/config/abis/ERC20";
import { Token } from "@/config/tokens";
import { Address, formatUnits, zeroAddress } from "viem";
import { useBalance, useReadContract } from "wagmi";

export const useTokenBalance = (address: Address, token: Token) => {
  const nativeBalance = useBalance({ address });

  const { data: tokenBalance } = useReadContract({
    address: token.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address],
  });

  return token.address === zeroAddress
    ? {
        balance: nativeBalance.data?.value ?? 0n,
        decimals: nativeBalance.data?.decimals ?? 18,
        formatted: formatUnits(
          nativeBalance.data?.value ?? 0n,
          nativeBalance.data?.decimals ?? 18
        ),
      }
    : {
        balance: tokenBalance ?? 0n,
        decimals: token.decimals,
        formatted: formatUnits((tokenBalance as bigint) ?? 0n, token.decimals),
      };
};
