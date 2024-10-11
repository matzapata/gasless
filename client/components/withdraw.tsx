import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useMemo, useState } from "react";
import TokenSelect from "./token-select";
import { useAccount } from "wagmi";
import { Token, tokens } from "@/config/tokens";
import ConnectButton from "./connect-button";

export default function Withdraw() {
  const account = useAccount();
  const [amount, setAmount] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [estimation,] = useState();
  const [token, setToken] = useState<Token>(tokens[10][0] as Token);

  const isWithdrawDisabled = useMemo(
    () => amount === "" || Number(amount) <= 0 || !account.address,
    [amount, account.address]
  );

  const isChainSupported = useMemo(
    () => !!account.chain && account.chain.id === 10,
    [account.chain]
  );

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <TokenSelect value={token} onSelect={setToken} options={tokens[10]} />
        <div className="bg-muted px-4 py-3 rounded-b-xl">
          <span className="text-sm text-muted-foreground">Sell for ETH</span>
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

      {account.isConnected && isChainSupported && (
        <Button disabled={isWithdrawDisabled} className="w-full" size={"lg"}>
          {isWithdrawDisabled ? "Enter amount" : "Withdraw"}
        </Button>
      )}

      {estimation && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex justify-between items-center cursor-pointer py-2">
              <span className="text-sm">Receive 0.1 ETH and 100 USDC</span>
              <ChevronDownIcon className="h-4 w-4" />
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-2 mt-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">
                Receive at least
              </span>
              <div className="text-right">
                <span className="text-sm block">0.1 ETH</span>
                <span className="text-sm block">100 USDC</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Swap fee</span>
              <span className="text-sm">0.01%</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">
                Swap fee (0.25%)
              </span>
              <span className="text-sm">$0.01</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">
                Relayer fee (0.1 ETH)
              </span>
              <span className="text-sm">$0.01</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">
                Network cost
              </span>
              <span className="text-sm">$0.01</span>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
