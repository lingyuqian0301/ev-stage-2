"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProjectDetails } from "@/lib/blockchain";

export default function ProjectDetailsPage() {
  const [projectId, setProjectId] = useState<number>(1);
  const [projectData, setProjectData] = useState<any>(null);
  const [error, setError] = useState<string>("");

  async function handleFetchDetails() {
    try {
      setError("");
      const data = await getProjectDetails(projectId);
      setProjectData(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Error fetching project details.");
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-xl font-bold mb-4">Get Project Details</h1>

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

      <Button onClick={handleFetchDetails}>Fetch Project Details</Button>

      {error && <p className="mt-4 text-red-500">{error}</p>}

      {projectData && (
        <div className="mt-4 space-y-2">
          {/* The returned struct is an array: [creator, title, description, fundingGoal, deadline, amountRaised, status] */}
          <p><strong>Creator:</strong> {projectData[0]}</p>
          <p><strong>Title:</strong> {projectData[1]}</p>
          <p><strong>Description:</strong> {projectData[2]}</p>
          <p><strong>Funding Goal:</strong> {projectData[3].toString()}</p>
          <p><strong>Deadline:</strong> {projectData[4].toString()}</p>
          <p><strong>Amount Raised:</strong> {projectData[5].toString()}</p>
          <p><strong>Status:</strong> {projectData[6].toString()}</p>
        </div>
      )}
    </div>
  );
}
