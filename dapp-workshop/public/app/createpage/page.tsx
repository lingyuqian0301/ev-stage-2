"use client"; // Make sure this is the very first line of the file.

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createProject } from "@/lib/blockchain"; // Ensure this path correctly points to your blockchain interaction functions

export default function CreateProjectPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [fundingGoal, setFundingGoal] = useState('');
    const [deadline, setDeadline] = useState('');
    const [status, setStatus] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('Creating project...');
        try {
            const receipt = await createProject(title, description, fundingGoal, deadline);
            setStatus(`Project created successfully! Transaction hash: ${receipt.transactionHash}`);
            setTitle('');
            setDescription('');
            setFundingGoal('');
            setDeadline('');
        } catch (error: any) {
            console.error(error);
            setStatus('Failed to create project. ' + error.message);
        }
    };

    return (
        <div className="container">
            <h1>Create New Project</h1>
            <form onSubmit={handleSubmit}>
                <Input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <Input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <Input
                    type="text"
                    placeholder="Funding Goal (in ETH)"
                    value={fundingGoal}
                    onChange={(e) => setFundingGoal(e.target.value)}
                />
                <Input
                    type="text"
                    placeholder="Deadline (timestamp or block number)"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                />
                <Button type="submit">Create Project</Button>
            </form>
            {status && <p>{status}</p>}
        </div>
    );
}
