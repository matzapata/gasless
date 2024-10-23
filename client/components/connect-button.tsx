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
                <button
                  onClick={openAccountModal}
                  type="button"
                  className="bg-muted px-4 py-3 rounded-xl w-full text-left overflow-x-scroll"
                >
                  <span className="text-sm text-muted-foreground block">
                    Forward tokens to:
                  </span>
                  <div className="flex items-center justify-between">
                    <span>{shortenAddress(account.address)}</span>

                    {chain.hasIcon && (
                      <div
                        className=""
                        style={{
                          background: chain.iconBackground,
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          overflow: "hidden",
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            style={{ width: 16, height: 16 }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })()}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
}
