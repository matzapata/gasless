"use client";

import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "./ui/button";
import { shortenAddress } from "@/lib/strings";

export default function ConnectButton() {
  return (
    <RainbowConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!ready) {
          return (
            <div className="bg-muted px-4 py-3 rounded-xl w-full text-left overflow-x-scroll">
              <span className="text-sm text-muted-foreground block">
                Forward tokens to:
              </span>
              <div className="animate-pulse bg-muted-foreground/30 rounded-md w-[200px] h-[14px] mt-1" />
            </div>
          );
        }

        return (
          <div>
            {(() => {
              if (!connected) {
                return (
                  <Button
                    className="w-full"
                    size={"lg"}
                    onClick={openConnectModal}
                  >
                    Connect Wallet
                  </Button>
                );
              }
              if (chain.unsupported) {
                return (
                  <Button
                    className="w-full"
                    size={"lg"}
                    variant={"destructive"}
                    onClick={openChainModal}
                    type="button"
                  >
                    Wrong network
                  </Button>
                );
              }
              return (
                <div className="bg-muted px-4 py-3 rounded-xl w-full text-left overflow-x-scroll">
                  <span className="text-sm text-muted-foreground block">
                    Forward tokens to:
                  </span>
                  <div className="flex items-center justify-between">
                    <button onClick={openAccountModal}>
                      {shortenAddress(account.address)}
                    </button>

                    <button
                      onClick={openChainModal}
                      className=""
                      style={{
                        background: chain.iconBackground,
                        width: 20,
                        height: 20,
                        borderRadius: 999,
                        overflow: "hidden",
                        marginRight: 4,
                      }}
                    >
                      <img
                        alt={chain.name ?? "Chain icon"}
                        src={chain.iconUrl}
                        style={{ width: 20, height: 20 }}
                      />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
}
