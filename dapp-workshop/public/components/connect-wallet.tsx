"use client"

import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { ConnectKitButton } from "connectkit"

interface ConnectWalletProps {
  className?: string
}

export default function ConnectWallet({ className }: ConnectWalletProps) {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, truncatedAddress, ensName }) => {
        return (
          <Button variant="outline" className={className} onClick={show}>
            <Wallet className="mr-2 h-4 w-4" />
            {isConnected ? ensName || truncatedAddress : "Connect Wallet"}
          </Button>
        )
      }}
    </ConnectKitButton.Custom>
  )
}

