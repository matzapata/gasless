import { shortenAddress } from "@/lib/strings";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { QRCode } from "react-qrcode-logo";
import { useAccount } from "wagmi";
import ConnectButton from "./connect-button";
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
    <div className="space-y-2">
      {account.isConnected && isLoading ? (
        <div className="bg-muted px-4 py-6 space-y-4 rounded-xl">
          <p className="text-center text-sm">Loading...</p>
        </div>
      ) : null}

      {forwarderAddress ? (
        <div className="bg-muted px-4 py-6 space-y-4 rounded-xl">
          <button
            disabled={copied}
            onClick={() => copyToClipboard(forwarderAddress as string)}
            className="bg-blue-100 w-min mx-auto px-4 rounded-full text-blue-700 flex justify-center items-center space-x-2 hover:opacity-80"
          >
            <span className="text-blue-600 font-medium">
              {copied ? "Copied!" : shortenAddress(forwarderAddress as string)}
            </span>
            <ClipboardDocumentIcon className="h-4 w-4" />
          </button>

          <div className="flex justify-center">
            <QRCode
              id="qrCode"
              value={forwarderAddress as string}
              size={300}
              bgColor={"#F1F5F9"}
              fgColor={"#172554"}
              qrStyle="dots"
              ecLevel="M"
            />
          </div>

          <p className="text-center text-sm">
            This account is owned by you and only you. Deposit any erc20 token
            to it to be capable of withdrawing it with some amount of native gas
            for your operations
          </p>
        </div>
      ) : (
        <div className="bg-muted px-4 py-3 space-y-4 rounded-xl text-sm text-center">
          <p>
            Connect wallet to compute your forwarder address for you to deposit
            tokens
          </p>
        </div>
      )}
      <ConnectButton />

      {/* <div className="bg-muted px-4 py-3 space-y-4 rounded-xl text-sm text-center">
        <p>If tokens are already in your wallet you can try to get gas through <span className="text-blue-600 underline cursor-pointer">permit</span></p>
      </div> */}
    </div>
  );
}
