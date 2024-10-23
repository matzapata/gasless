"use client";

import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "./ui/button";

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
        const connected =
          ready &&
          account &&
          chain;
          
        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button className="w-full" size={"lg"} onClick={openConnectModal}>
                    Connect Wallet
                  </Button>
                );
              }
              if (chain.unsupported) {
                return (
                  <Button className="w-full" size={"lg"} variant={"destructive"} onClick={openChainModal} type="button">
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
                  <span className="text-sm text-muted-foreground block">Forward tokens to:</span>
                  <span>{account.address}</span>
                </button>
              );
            })()}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
}
