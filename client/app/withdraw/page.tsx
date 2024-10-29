"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TokenSelect } from "@/components/token-select";
import { useAccount } from "wagmi";
import { Token, tokens } from "@/config/tokens";
import ConnectButton from "@/components/connect-button";
import { ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useForwarder } from "@/hooks/use-forwarder";
import { useTokenBalance } from "@/hooks/use-token-balance";
import { useQuote } from "@/hooks/use-quote";
import { useFlush } from "@/hooks/use-flush";
import { Address, formatUnits } from "viem";
import { cn } from "@/lib/utils";

export default function Withdraw() {
  const account = useAccount();
  const { toast } = useToast();
  const chainId = account.chainId ?? 137;

  const [amount, setAmount] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState<Token>(tokens[chainId][0]);

  const { data: forwarder } = useForwarder();
  const balance = useTokenBalance(forwarder, token);
  const { quote, isPending: isQuotePending } = useQuote(token.address, amount);
  const { flush, isPending: isFlushPending } = useFlush(forwarder);

  const isChainSupported = !!account.chain && [10, 137].includes(account.chain.id);
  const nativeCurrency = account.chain?.nativeCurrency.symbol ?? "ETH";
  const nativeDecimals = account.chain?.nativeCurrency.decimals ?? 18;
  const receivesToken = BigInt(quote?.estimate?.tokenOut ?? 0) > 0;

  useEffect(() => {
      setToken(tokens[chainId][0]);
  }, [chainId])

  const isWithdrawEnabled = useMemo(
    () =>
      quote &&
      !quote.error &&
      quote?.estimate.enoughForFees &&
      Number(balance.formatted) > Number(amount),
    [amount, quote, balance?.formatted]
  );

  const insufficientFunds = useMemo(() => {
    return !isQuotePending && (quote?.error || !quote?.estimate.enoughForFees);
  }, [quote, isQuotePending]);

  const onFlushClick = useCallback(() => {
    setAmount("");

    toast({
      title: "Withdraw Started",
      description: "Waiting for confirmation...",
    });

    flush(quote!)
      .then((withdrawTx: Address) => {
        toast({
          title: "Withdraw Ongoing",
          description: "Check your transaction in the explorer",
          action: (
            <ToastAction
              altText="check"
              onClick={() =>
                window.open(
                  account.chain?.blockExplorers.default.url +
                    `/tx/${withdrawTx}`,
                  "_blank",
                  "noreferrer"
                )
              }
            >
              Explore
            </ToastAction>
          ),
        });
      })
      .catch((err) => {
        toast({
          title: "Withdraw Failed",
          description: err?.message,
          variant: "destructive",
        });
      });
  }, [quote, flush, toast, account.chain?.blockExplorers.default.url]);

  return (
    <div className="min-h-screen flex flex-col items-center md:pt-32 pt-10 ">
      <div className={cn("w-screen md:max-w-[450px] px-4", {
        "space-y-1": account.isConnected,
        "space-y-2": !account.isConnected,
      })}>
        <div className="space-y-1">
          <TokenSelect
            value={token}
            balance={balance.formatted}
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
              className="block bg-transparent w-full text-center text-6xl h-32 focus:outline-none"
              placeholder="0"
            />
            {insufficientFunds && (
              <span className="text-xs text-red-500 text-center block">
                Insufficient funds
              </span>
            )}
          </div>
        </div>

        <ConnectButton />
      </div>

      <div className="space-y-1 w-screen md:max-w-[450px] px-4 mt-2">
        {account.isConnected && isChainSupported && (
          <Button
            disabled={!isWithdrawEnabled || isQuotePending || isFlushPending || !quote}
            className="w-full  font-medium"
            size={"lg"}
            onClick={onFlushClick}
          >
            {!isWithdrawEnabled
              ? "Enter amount"
              : isQuotePending || isFlushPending
              ? "Loading..."
              : "Withdraw"}
          </Button>
        )}

        {quote?.estimate && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <div className="flex justify-between items-center cursor-pointer py-2">
                <span className="text-sm">
                  Receive{" "}
                  {formatUnits(BigInt(quote.estimate.nativeOut), nativeDecimals)}{" "}
                  {nativeCurrency}
                  {receivesToken && (
                    <span>
                      {" and "}{formatUnits(BigInt(quote.estimate.tokenOut), token.decimals)}{" "}
                      {token.symbol}
                    </span>
                  )}
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
                    {formatUnits(BigInt(quote.estimate.nativeOutMin), nativeDecimals)}{" "}
                    {nativeCurrency}
                  </span>
                  {receivesToken && (
                    <span className="text-sm block">
                      {formatUnits(BigInt(quote.estimate.tokenOutMin), token.decimals)}{" "}
                      {token.symbol}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">
                  Relayer fee
                </span>
                <span className="text-sm">
                  {formatUnits(BigInt(quote.estimate.relayerFee), nativeDecimals)}{" "}
                  {nativeCurrency}
                </span>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}
