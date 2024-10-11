import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

export default function Permit() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <button className="bg-muted rounded-t-lg flex justify-between items-center w-full px-4 py-3">
          <div className="flex items-center space-x-3">
            <img
              src="https://app.uniswap.org/static/media/eth-logo.a1eb5a0f1291810970bc.png"
              className="h-9 w-9"
            />
            <div className="text-left">
              <span className="block text-sm font-medium uppercase">ETH</span>
              <span className="block text-xs text-muted-foreground">
                Balance: 0
              </span>
            </div>
          </div>
          <ChevronDownIcon className="h-4 w-4" />
        </button>
        <div className="bg-muted px-4 py-3 rounded-b-xl">
          <span className="text-sm text-muted-foreground">Sell for ETH</span>
          <input
            type="text"
            className="block bg-transparent w-full text-center text-6xl py-10 focus:outline-none"
            placeholder="0"
          />
        </div>
      </div>
      <div className="bg-muted px-4 py-3 rounded-xl">
        <span className="text-sm text-muted-foreground">To</span>
        <p>0x7aF08613Bd9E2111EbA13a2d5d08a9A0cF4d3307</p>
      </div>
      <Button className="w-full" size={"lg"}>
        Withdraw
      </Button>
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
            <span className="text-muted-foreground text-sm">Network cost</span>
            <span className="text-sm">$0.01</span>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
