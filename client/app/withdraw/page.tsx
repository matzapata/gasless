"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useMemo, useState } from "react";
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

  const isWithdrawDisabled = useMemo(
    () =>
      amount === "" ||
      Number(amount) <= 0 ||
      !account.address ||
      Number(amount) > Number(balance.formatted),
    [amount, account.address]
  );

  const isChainSupported = useMemo(
    () => !!account.chain && account.chain.id === 137,
    [account.chain]
  );

  const nativeCurrency = useMemo(() => {
    return account.chain?.nativeCurrency.symbol ?? "ETH";
  }, [chainId]);

  const receivesToken = useMemo(() => {
    console.log("quote", quote);
    return false;
  }, [quote]);

  return (
    <div className="min-h-screen flex flex-col items-center md:pt-32 pt-10 ">
      <div className="space-y-1 w-screen md:max-w-[450px] px-4">
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
            disabled={isWithdrawDisabled || isQuotePending || isFlushPending}
            className="w-full  font-medium"
            size={"lg"}
            onClick={() => {
              setAmount("");
              flush(quote)
                .then((res: any) => {
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
                })
                .catch((err: any) => {
                  toast({
                    title: "Withdraw Failed",
                    description: err.message,
                  });
                });
            }}
          >
            {isWithdrawDisabled
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
                  Receive ~{quote.estimate.nativeOut.slice(0, 6)}{" "}
                  {nativeCurrency}
                  {receivesToken && (
                    <span>
                      and {quote.estimate.tokenOut.slice(0, 6)}{" "}
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
                    {quote.estimate.nativeOutMin.slice(0, 6)}{" "}
                    {nativeCurrency}
                  </span>
                  {receivesToken && (
                    <span className="text-sm block">
                      {quote.estimate.tokenOutMin.slice(0, 6)}{" "}
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
