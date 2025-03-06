'use client';
'use client';

import { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { fundProject } from '../../../dapp-workshop/public/lib/blockchain';
import { useAccount } from 'wagmi';

export default function ProjectPage({ params }: { params: { id: string } }) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();

  const handleFund = async () => {
    try {
      if (!isConnected || !address) {
        toast.error("Please connect your wallet first");
        return;
      }

      setIsLoading(true);
      
      if (!amount) {
        toast.error("Please enter an amount to fund");
        return;
      }

      // Validate minimum amount
      if (parseFloat(amount) < 0.0000001) {
        toast.error("Amount must be at least 0.0000001 ETH");
        return;
      }

      await fundProject(Number(params.id), amount, address);
      toast.success("Project funded successfully!");
      setAmount(''); // Reset amount after successful funding
      
    } catch (error: any) {
      console.error("Funding error:", error);
      if (error.message === "Invalid amount") {
        toast.error("Please enter a valid amount");
      } else if (error.message === "No wallet found") {
        toast.error("Please install a Web3 wallet");
      } else if (error.reason === "Project is not active") {
        toast.error("This project is not currently active for funding");
      } else {
        toast.error("Failed to fund project. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const ProjectStatus = {
    0: "Pending",
    1: "Active",
    2: "Completed",
    3: "Expired"
  };

  // In your JSX
  <div className="mb-4">
    <span className="font-bold">Status: </span>
    <span className={`${
      projectStatus === 1 ? 'text-green-500' : 'text-red-500'
    }`}>
      {ProjectStatus[projectStatus]}
    </span>
  </div>

  {projectStatus === 1 && (
    // Show funding form only if project is active
    <div className="funding-form">
      {/* Your funding form */}
    </div>
  )} 

  // In your JSX, add step and min attributes to prevent very small numbers
  <input
    type="number"
    step="0.0000001"
    min="0.0000001"
    value={amount}
    onChange={(e) => setAmount(e.target.value)}
    disabled={isLoading || !isConnected}
    className="..."
  /> 

  <button 
    onClick={handleFund}
    disabled={isLoading || !isConnected}
    className="..."
  >
    {isLoading ? 'Processing...' : 'Fund Project'}
  </button>
} 