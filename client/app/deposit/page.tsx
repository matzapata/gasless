"use client";
import { shortenAddress } from "@/lib/strings";
import { QRCode } from "react-qrcode-logo";
import { useAccount } from "wagmi";
import ConnectButton from "@/components/connect-button";
import { useCopyToClipboard } from "@/hooks/use-copy";
import { ClipboardCopy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForwarder } from "@/hooks/use-forwarder";

export default function DepositCard() {
  const account = useAccount();
  const {data: forwarder, isPending: forwarderIsPending } = useForwarder();
  const { copied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

  return (
    <div className="min-h-screen flex flex-col items-center md:pt-32 pt-10 ">
      <div className={cn("w-screen md:max-w-[450px] px-4", {
        "space-y-1": account.isConnected,
        "space-y-2": !account.isConnected,
      })}>
        {account.isConnected && forwarderIsPending ? (
          <div className="bg-muted px-4 py-6 space-y-4 rounded-xl">
            <p className="text-center text-sm">Loading...</p>
          </div>
        ) : forwarder ? (
          <div className="bg-muted px-4 py-6 space-y-4 rounded-xl">
            <button
              disabled={copied}
              onClick={() => copyToClipboard(forwarder)}
              className="hover:text-accent-foreground text-secondary-foreground w-min mx-auto px-4 rounded-full flex justify-center items-center space-x-2"
            >
              <span className="font-medium">
                {copied
                  ? "Copied!"
                  : shortenAddress(forwarder)}
              </span>
              <ClipboardCopy className="h-4 w-4" />
            </button>

            <div className="flex justify-center">
              <QRCode
                id="qrCode"
                value={forwarder}
                size={300}
                bgColor={"#262626"}
                fgColor={"#71717a"}
                qrStyle="dots"
                ecLevel="M"
              />
            </div>

            <p className="text-center text-sm">
              This account is owned by you and only you. Deposit any erc20 token
              to it to be capable of withdrawing it with some amount of native
              gas for your operations
            </p>
          </div>
        ) : (
          <div className="bg-muted px-4 py-3 space-y-4 rounded-xl text-sm text-center">
            <p>
              Connect wallet to compute your forwarder address for you to
              deposit tokens
            </p>
          </div>
        )}

        <ConnectButton />
      </div>
    </div>
  );
}
