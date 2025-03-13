'use client'

import { useState } from 'react'
import { useContractWrite, useContractRead } from 'wagmi'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { crowdfundingABI } from '@/lib/contracts'

interface VoteRequestProps {
  requestId: number
  projectAddress: string
}

export function VoteRequest({ requestId, projectAddress }: VoteRequestProps) {
  const [isVoting, setIsVoting] = useState(false)

  const { data: requestDetails } = useContractRead({
    address: projectAddress,
    abi: crowdfundingABI,
    functionName: 'getRequest',
    args: [requestId],
  })

  const { data: isApproved } = useContractRead({
    address: projectAddress,
    abi: crowdfundingABI,
    functionName: 'isRequestApproved',
    args: [requestId],
  })

  const { data: totalContributions } = useContractRead({
    address: projectAddress,
    abi: crowdfundingABI,
    functionName: 'totalContributions',
  })

  const { write: vote } = useContractWrite({
    address: projectAddress,
    abi: crowdfundingABI,
    functionName: 'vote',
  })

  const { write: finalizeRequest } = useContractWrite({
    address: projectAddress,
    abi: crowdfundingABI,
    functionName: 'finalizeRequest',
  })

  const approvalPercentage = totalContributions && requestDetails?.approvalCount
    ? (Number(requestDetails.approvalCount) / Number(totalContributions)) * 100
    : 0

  const handleVote = async () => {
    setIsVoting(true)
    try {
      await vote({ args: [requestId] })
    } catch (error) {
      console.error('Error voting:', error)
    }
    setIsVoting(false)
  }

  const handleFinalize = async () => {
    try {
      await finalizeRequest({ args: [requestId] })
    } catch (error) {
      console.error('Error finalizing:', error)
    }
  }

  if (!requestDetails) return null

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold">Request #{requestId + 1}</h3>
        <p>{requestDetails.description}</p>
        <p className="text-sm text-gray-500">
          Amount: {requestDetails.value.toString()} ETH
        </p>
        <p className="text-sm text-gray-500">
          Recipient: {requestDetails.recipient}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Approval Progress</span>
          <span>{approvalPercentage.toFixed(1)}%</span>
        </div>
        <Progress value={approvalPercentage} />
      </div>

      <div className="flex gap-2">
        {!requestDetails.complete && (
          <>
            <Button 
              onClick={handleVote} 
              disabled={isVoting || requestDetails.complete}
            >
              {isVoting ? 'Voting...' : 'Vote'}
            </Button>
            {isApproved && (
              <Button 
                onClick={handleFinalize}
                variant="outline"
              >
                Finalize Request
              </Button>
            )}
          </>
        )}
        {requestDetails.complete && (
          <span className="text-sm text-green-600">Request completed</span>
        )}
      </div>
    </div>
  )
} 