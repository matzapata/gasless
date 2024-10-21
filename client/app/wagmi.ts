import { http, cookieStorage, createConfig, createStorage } from 'wagmi'
import { polygon } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

export function getConfig() {
  return createConfig({
    chains: [polygon],
    connectors: [
      injected(),
      walletConnect({
        projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
      }),
      metaMask(),
    ],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [polygon.id]: http(),
    },
  })
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getConfig>
  }
}