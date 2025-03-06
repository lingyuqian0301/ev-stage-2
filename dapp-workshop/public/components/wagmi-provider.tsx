'use client';

import { WagmiConfig, createConfig } from "wagmi"
import { ConnectKitProvider, getDefaultConfig } from "connectkit"
import { scrollSepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a client
const queryClient = new QueryClient()

const config = createConfig(
  getDefaultConfig({
    // Required API Keys
    alchemyId: process.env.NEXT_PUBLIC_ALCHEMY_ID || '', // or infuraId
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
    
    // Required
    appName: "Your App Name",

    // Optional
    chains: [scrollSepolia],
  }),
)

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
        <ConnectKitProvider>
          {children}
        </ConnectKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  )
}