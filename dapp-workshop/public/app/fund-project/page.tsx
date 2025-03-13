"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fundProject } from "@/lib/blockchain";

export default function FundProjectPage() {
  const [projectId, setProjectId] = useState<number>(1);
  const [amount, setAmount] = useState<string>("0.01");
  const [status, setStatus] = useState<string>("");

  async function handleFund() {
    try {
      setStatus("Sending transaction...");
      const receipt = await fundProject(projectId, amount);
      setStatus(`Success! Tx Hash: ${receipt.transactionHash}`);
    } catch (error: any) {
      console.error(error);
      setStatus(error?.message || "Transaction failed.");
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-xl font-bold mb-4">Fund a Project</h1>

      <div className="mb-4">
        <label className="block font-semibold">
          Project ID:
          <Input
            type="number"
            value={projectId}
            onChange={(e) => setProjectId(Number(e.target.value))}
            className="mt-1"
          />
        </label>
      </div>

      <div className="mb-4">
        <label className="block font-semibold">
          Amount (ETH):
          <Input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1"
          />
        </label>
      </div>

      <Button onClick={handleFund}>Fund Project</Button>

      {status && (
        <p className="mt-4">
          {status}
        </p>
      )}
    </div>
  );
}
