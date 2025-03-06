import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { WagmiProvider } from "@/components/wagmi-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EV Crowdfunding Platform",
  description: "Support innovative electric vehicle projects on the Scroll testnet",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider>
          {children}
        </WagmiProvider>
      </body>
    </html>
  )
}



import './globals.css'