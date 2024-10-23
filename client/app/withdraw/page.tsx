"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useCallback, useMemo, useState } from "react";
import { TokenSelect } from "@/components/token-select";
import { useAccount, useBalance, useReadContract, useSignTypedData } from "wagmi";
import { Token, tokens } from "@/config/tokens";
import ConnectButton from "@/components/connect-button";
import { ERC20_ABI } from "@/config/abis/ERC20";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { FlushType } from "@/config/abis/ForwarderFactory";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { formatUnits, zeroAddress } from "viem";

export default function Withdraw() {
  const { toast } = useToast();
  const account = useAccount();
  const nativeBalance = useBalance({
    address: account.address,
  })
  const { signTypedDataAsync } = useSignTypedData();
  const chainId = account.chainId ?? 137;

  const [amount, setAmount] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState<Token>(tokens[chainId][0]);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const { data: forwarderAddress } = useQuery({
    queryKey: ["forwarder", account.address],
    queryFn: () =>
      fetch(
        `/api/deposit?userAddress=${account.address}&chainId=${account.chainId}`
      )
        .then((res) => res.json())
        .then((res) => res.forwarder),
    enabled: !!account.address && !!account.chainId,
  });

  const { data: tokenBalance } = useReadContract({
    address: token.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [forwarderAddress as string],
  });

  const balance = useMemo(() => {
    if (token.address === zeroAddress) {
      return Number(formatUnits(nativeBalance.data?.value ?? 0n, nativeBalance.data?.decimals ?? 18));
    } else if (tokenBalance) {
      return Number(tokenBalance.toString()) / 10 ** token.decimals;
    } else {
      return 0;
    }
  }, [tokenBalance, token]);

  const isWithdrawDisabled = useMemo(
    () =>
      amount === "" ||
      Number(amount) <= 0 ||
      !account.address ||
      Number(amount) > balance,
    [amount, account.address]
  );

  const isChainSupported = useMemo(
    () => !!account.chain && account.chain.id === 137,
    [account.chain]
  );

  const { data: quote, isPending: quotePending } = useQuery({
    queryKey: [account.address ?? "-", token.address, amount],
    queryFn: () =>
      fetch(
        `/api/estimate?user=${account.address}&token=${token.address}&amount=${amount}&chain=${account.chainId}`
      ).then((res) => res.json()),
    enabled: !isWithdrawDisabled,
  });

  const nativeCurrency = useMemo(() => {
    return account.chain?.nativeCurrency.symbol ?? "ETH";
  }, [chainId]);

  const withdraw = useCallback(async () => {
    try {
      setWithdrawLoading(true);

      const signature = await signTypedDataAsync({
        domain: {
          name: "Forwarder",
          version: "1",
          chainId,
          verifyingContract: forwarderAddress,
        },
        types: { Flush: FlushType },
        primaryType: "Flush",
        message: quote.params,
      });

      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote,
          chainId,
          signature,
          user: account.address,
        }),
      }).then((res) => res.json());

      if (!res.withdrawTx) {
        throw new Error("Something went wrong");
      }

      toast({
        title: "Withdraw Ongoing",
        description: "Check your transaction in the explorer",
        action: (
          <ToastAction
            altText="check"
            onClick={() =>
              window.open(
                account.chain?.blockExplorers.default.url +
                  `/tx/${res.withdrawTx}`,
                "_blank",
                "noreferrer"
              )
            }
          >
            Explore
          </ToastAction>
        ),
      });

      setAmount("");
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Withdraw Failed",
        description: e?.message,
      });
    } finally {
      setWithdrawLoading(false);
    }
  }, [quote]);

  return (
    <div className="min-h-screen flex flex-col items-center md:pt-32 pt-10 ">
      <div className="space-y-1 w-screen md:max-w-[450px] px-4">
        <div className="space-y-1">
          <TokenSelect
            value={token}
            balance={balance ?? 0}
            onSelect={setToken}
            options={tokens[chainId] || []}
          />
          <div className="bg-muted px-4 py-3 rounded-b-xl">
            <span className="text-sm text-muted-foreground">
              Sell for {nativeCurrency}
            </span>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block bg-transparent w-full text-center text-6xl py-10 focus:outline-none"
              placeholder="0"
            />
          </div>
        </div>

        <ConnectButton />
      </div>

      <div className="space-y-1 w-screen md:max-w-[450px] px-4 mt-2">
        {account.isConnected && isChainSupported && (
          <Button
            disabled={isWithdrawDisabled || quotePending || withdrawLoading}
            className="w-full  font-medium"
            size={"lg"}
            onClick={withdraw}
          >
            {isWithdrawDisabled
              ? "Enter amount"
              : quotePending || withdrawLoading
              ? "Loading..."
              : "Withdraw"}
          </Button>
        )}

        {quote?.estimate && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <div className="flex justify-between items-center cursor-pointer py-2">
                <span className="text-sm">
                  Receive ~{quote.estimate.nativeOut.slice(0, 6)}{" "}
                  {nativeCurrency} and {quote.estimate.tokenOut.slice(0, 6)}{" "}
                  {token.symbol}
                </span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-2 mt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Receive at least
                </span>
                <div className="text-right">
                  <span className="text-sm block">
                    {quote.estimate.nativeOutMin.slice(0, 6)} {nativeCurrency}
                  </span>
                  <span className="text-sm block">
                    {quote.estimate.tokenOutMin.slice(0, 6)} {token.symbol}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">
                  Relayer fee
                </span>
                <span className="text-sm">
                  {quote.estimate.relayerFee.slice(0, 6)} {nativeCurrency}
                </span>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}
