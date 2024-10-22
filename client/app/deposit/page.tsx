"use client";
import { shortenAddress } from "@/lib/strings";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { QRCode } from "react-qrcode-logo";
import { useAccount } from "wagmi";
import ConnectButton from "@/components/connect-button";
import { useCopyToClipboard } from "@/hooks/use-copy";
import { useQuery } from "@tanstack/react-query";

export default function DepositCard() {
  const account = useAccount();
  const { copied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

  const { data: forwarderAddress, isLoading } = useQuery({
    queryKey: ["forwarder", account.address],
    queryFn: () =>
      fetch(
        `/api/deposit?userAddress=${account.address}&chainId=${account.chainId}`
      )
        .then((res) => res.json())
        .then((res) => res.forwarder),
    enabled: !!account.address && !!account.chainId,
  });

  return (
    <div className="min-h-screen flex flex-col items-center md:pt-32 pt-10 ">
      <div className="space-y-2 w-screen md:max-w-[450px] px-4">
        {account.isConnected && isLoading ? (
          <div className="bg-muted px-4 py-6 space-y-4 rounded-xl">
            <p className="text-center text-sm">Loading...</p>
          </div>
        ) : forwarderAddress ? (
          <div className="bg-muted px-4 py-6 space-y-4 rounded-xl">
            <button
              disabled={copied}
              onClick={() => copyToClipboard(forwarderAddress as string)}
              className="hover:text-accent-foreground text-secondary-foreground w-min mx-auto px-4 rounded-full flex justify-center items-center space-x-2"
            >
              <span className="font-medium">
                {copied
                  ? "Copied!"
                  : shortenAddress(forwarderAddress as string)}
              </span>
              <ClipboardDocumentIcon className="h-4 w-4" />
            </button>

            <div className="flex justify-center">
              <QRCode
                id="qrCode"
                value={forwarderAddress as string}
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
