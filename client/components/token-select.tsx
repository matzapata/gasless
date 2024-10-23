import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DialogClose } from "@radix-ui/react-dialog";
import { ChevronDown, Coins, SearchIcon, X } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Token } from "@/config/tokens";
import { useEffect, useState } from "react";
import { shortenAddress } from "@/lib/strings";

export const TokenSelect: React.FC<{
  value: Token;
  balance?: number;
  loading?: boolean;
  options: Token[];
  onSelect: (token: Token) => void;
}> = (props) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Return null during server-side rendering
    return (
      <div className="bg-muted rounded-t-lg flex justify-between items-center w-full px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-full bg-muted-foreground/30 flex justify-center items-center">
            <Coins className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <div className="animate-pulse bg-muted-foreground/30 rounded-md w-[200px] h-[14px]" />
            <div className="animate-pulse bg-muted-foreground/30 rounded-md w-[150px] h-[12px]" />
          </div>
        </div>
      </div>
    );
  }

  const filteredOptions = props.options.filter((option) =>
    option.symbol.toLowerCase().startsWith(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full">
        <button className="bg-muted rounded-t-lg flex justify-between items-center w-full px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-muted-foreground/30 flex justify-center items-center">
              {props.value.image ? (
                <img
                  src={props.value.image}
                  className="h-9 w-9 rounded-full bg-muted-foreground/30"
                />
              ) : (
                <Coins className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="text-left">
              <span className="block text-sm font-medium uppercase">
                {props.value.symbol}
              </span>
              <span
                className={cn("block text-xs text-muted-foreground", {
                  "animate-pulse": props.loading,
                })}
              >
                Balance: {props.loading ? "..." : props.balance}
              </span>
            </div>
          </div>
          <ChevronDown className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="w-[400px] space-y-0 gap-0">
        <DialogTitle className="hidden">Select token</DialogTitle>

        <div className="flex space-y-0 flex-row justify-between items-center px-4 py-4">
          <h1 className="text-lg font-medium leading-none tracking-tight">
            Select token
          </h1>
          <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>
        <div>
          <div className="px-4 relative">
            <SearchIcon className="absolute left-8 top-[24px] -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-[48px] rounded-full px-10 py-2 bg-muted"
              placeholder="Search tokens"
            />
          </div>
          <div className="flex items-center px-4 pt-4 pb-2 space-x-2">
            <SearchIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">
              Search results
            </span>
          </div>
          <ScrollArea className="h-96">
            {filteredOptions.map((token) => (
              <TokenButton
                key={token.address}
                token={token}
                className="hover:opacity-80 w-full"
                onClick={() => {
                  props.onSelect(token);
                  setOpen(false);
                }}
              />
            ))}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function TokenButton(props: {
  token: Token;
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={() => props.onClick()}
      className={cn(
        "flex space-x-4 px-4 py-3 items-center hover:opacity-80 group",
        props.className
      )}
    >
      <div className="h-10 w-10 rounded-full bg-muted flex justify-center items-center">
        {props.token.image ? (
          <img
            src={props.token.image}
            className="h-10 w-10 rounded-full bg-gray-100"
          />
        ) : (
          <Coins className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div className="text-left">
        <span className="block text-base font-medium">{props.token.name}</span>
        <span className="block text-sm text-muted-foreground group-hover:hidden">
          {props.token.symbol}
        </span>
        <span className="group-hover:block hidden text-sm text-muted-foreground">
          {shortenAddress(props.token.address)}
        </span>
      </div>
    </button>
  );
}
