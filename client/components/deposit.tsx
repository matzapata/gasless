import { shortenAddress } from "@/lib/strings";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { QRCode } from "react-qrcode-logo";
import { useAccount } from "wagmi";
import ConnectButton from "./connect-button";

export default function DepositCard() {
  const account = useAccount();

  return (
    <div className="space-y-2">
      {account.address ? (
        <div className="bg-muted px-4 py-6 space-y-4 rounded-xl">
          <button className="bg-blue-100 w-min mx-auto px-4 rounded-full text-blue-600 flex justify-center items-center space-x-2">
            <span className="text-blue-600 font-medium">
              {shortenAddress("0x7aF08613Bd9E2111EbA13a2d5d08a9A0cF4d3307")}
            </span>
            <ClipboardDocumentIcon className="h-4 w-4" />
          </button>
          <div className="flex justify-center">
            <QRCode
              id="qrCode"
              value={"0x7aF08613Bd9E2111EbA13a2d5d08a9A0cF4d3307"}
              size={300}
              bgColor={"#F1F5F9"}
              // fgColor={"#2563E"} TODO:
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
