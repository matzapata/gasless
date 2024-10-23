import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { Metadata } from "next";
import { Header } from "./header";
import Link from "next/link";
import { Providers } from "./providers";
import { cookieToInitialState } from "wagmi";
import { headers } from "next/headers";
import { getConfig } from "./wagmi";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Gassless",
  description: "Receive erc tokens without any gas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(
    getConfig(),
    headers().get("cookie")
  );

  return (
    <html lang="en" className="dark">
      <head />
      <body className="relative min-h-screen bg-black bg-gradient-to-tr from-zinc-900/50 to-zinc-700/30">
        <Header />

        <Providers initialState={initialState}>
          <main className="min-h-[80vh]">{children}</main>
          <Toaster />
        </Providers>

        <footer className="bottom-0 border-t inset-2x-0 border-zinc-500/10">
          <div className="flex flex-col gap-1 px-6 py-12 mx-auto text-xs text-center text-zinc-700 max-w-7xl lg:px-8">
            <p>
              Built by{" "}
              <Link
                href="https://twitter.com/matzapataa"
                className="font-semibold duration-150 hover:text-zinc-200"
              >
                @matzapataa
              </Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
