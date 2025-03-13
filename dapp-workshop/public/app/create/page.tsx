"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProject } from "@/lib/blockchain";

export default function NewProjectPage() {
  // Local state for form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fundingGoal, setFundingGoal] = useState(""); // in ETH or desired unit
  const [deadline, setDeadline] = useState(""); // e.g. block timestamp or days from now?
  const [loading, setLoading] = useState(false);

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Call your contract function
      const txReceipt = await createProject(title, description, fundingGoal, deadline);
      console.log("Transaction receipt:", txReceipt);
      alert("Project created successfully!");
      // Reset form
      setTitle("");
      setDescription("");
      setFundingGoal("");
      setDeadline("");
    } catch (err: any) {
      console.error("Error creating project:", err);
      alert(`Error: ${err.message || "Failed to create project"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container px-4 py-12 md:px-6 md:py-16">
      <h1 className="text-3xl font-bold tracking-tighter md:text-4xl mb-8">Create a New Project</h1>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
        {/* Title */}
        <div>
          <label className="block mb-2 font-medium">Project Title</label>
          <Input
            type="text"
            placeholder="Enter project title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2 font-medium">Project Description</label>
          <Input
            type="text"
            placeholder="Enter a brief description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Funding Goal */}
        <div>
          <label className="block mb-2 font-medium">Funding Goal (ETH)</label>
          <Input
            type="number"
            step="0.001"
            placeholder="e.g. 10"
            value={fundingGoal}
            onChange={(e) => setFundingGoal(e.target.value)}
            required
          />
        </div>

        {/* Deadline */}
        <div>
          <label className="block mb-2 font-medium">Deadline (Timestamp or Days)</label>
          <Input
            type="text"
            placeholder="e.g. 1699999999 or 30"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>

        {/* Submit */}
        <div>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </form>
    </div>
  );
}
