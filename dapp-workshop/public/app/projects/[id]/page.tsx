"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Battery, Clock, Users } from "lucide-react";
import { useAccount } from "wagmi";

import { fundProject, voteRequest, finalizeRequest } from "@/lib/blockchain";
import {
  getProjectStruct,
  getProjectFunding,
  getProjectBackers,
  // If you have a function to check total project count:
  // getProjectCount
} from "@/lib/blockchain";

import ConnectWallet from "@/components/connect-wallet";

// Contract's Project struct type
interface ChainProject {
  id: number;
  owner: string;
  fundingGoal: number;     // In Wei if your contract stores it that way
  currentFunding: number;  // In ETH (float) from getProjectFunding
  backers: number;
  active: boolean;
}

export default function ProjectDetailPage() {
  // e.g. /projects/chain-5 => id = "5"
  //trimming the id to remove the "chain-" prefix
  const { id: idParam } = useParams();
  // ...existing code...
  const id = idParam.replace("chain-", "");
  const { isConnected, address } = useAccount();

  // Basic states
  const [fundAmount, setFundAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // The data we fetch from the chain
  const [chainProject, setChainProject] = useState<ChainProject | null>(null);

  // Logging only
  console.log("ProjectDetailPage route param =>", id);

  // Example "requests" for voting – your contract doesn't implement these yet
  const [votingRequests, setVotingRequests] = useState([
    {
      id: "1",
      description: "Purchase EV charging equipment",
      recipient: "0xABC123",
      amount: 0.0001,
      votesFor: 84,
      votesAgainst: 16,
      totalVotingPower: 100,
      votingDeadline: new Date(Date.now() + 86400 * 1000).toISOString(),
      executed: false,
    },
    {
      id: "2",
      description: "Upgrade charging station software",
      recipient: "0xDEF456",
      amount: 0.00005,
      votesFor: 50,
      votesAgainst: 30,
      votingDeadline: new Date(Date.now() - 86400 * 1000).toISOString(),
      executed: false,
    },
  ]);

  useEffect(() => {
    const fetchChainProject = async () => {
      if (!id) {
        console.log("No ID found in route; cannot fetch project from chain.");
        return;
      }

      const projectId = parseInt(id as string, 10);
      if (isNaN(projectId)) {
        console.log("Route param is not a valid number:", id);
        return;
      }

      try {
        console.log("Fetching chain data for projectId =", projectId);
        // If you want to confirm the ID is within total count, you can do:
        // const total = await getProjectCount();
        // if (projectId < 1 || projectId > total) {
        //   console.log(`Project ID ${projectId} is out of range. Total is ${total}.`);
        //   return;
        // }

        // 1) Read the project struct from your contract's mapping
        const structData = await getProjectStruct(projectId);
        console.log("structData =>", structData);

        // 2) Read the current funding in ETH
        const funding = await getProjectFunding(projectId);
        console.log("currentFunding =>", funding);

        // 3) Read the total backers
        const totalBackers = await getProjectBackers(projectId);
        console.log("backers =>", totalBackers);

        // If there's no revert, we can set chainProject
        setChainProject({
          id: structData.id, // or Number(structData.id)
          owner: structData.owner,
          fundingGoal: Number(structData.fundingGoal), // If in Wei, you might parse further
          currentFunding: funding,                     // in ETH
          backers: totalBackers,
          active: structData.active,
        });
      } catch (error) {
        console.error("Error fetching project from chain:", error);
      }
    };

    fetchChainProject();
  }, [id]);

  // "Dummy" fallback for fields not in your contract
  // or if chainProject is null
  const project = {
    // We'll prefer the chain data if it exists
    id: id || "N/A",
    title: "SolarDrive EV", // Contract doesn't store a title
    owner: chainProject?.owner || "0xOwnerAddress",
    description: "Solar-powered electric vehicle with 400 mile range",
    longDescription:
      "The SolarDrive EV represents the next generation of sustainable transportation. Featuring integrated solar panels ...",
    image: "/product_solardrive3.webp?height=200&width=400",
    fundingGoal: chainProject ? chainProject.fundingGoal : 500000,
    currentFunding: chainProject ? chainProject.currentFunding : 325000,
    daysLeft: 15, // not on-chain, just a placeholder
    backers: chainProject ? chainProject.backers : 1240,
    team: [
      {
        name: "Elena Rodriguez",
        role: "Founder & CEO",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        name: "Michael Chen",
        role: "CTO",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        name: "Sarah Johnson",
        role: "Lead Engineer",
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
    updates: [
      {
        date: "2023-11-15",
        title: "Production Prototype Completed",
        content:
          "We're excited to announce that we've completed our production prototype ...",
      },
      {
        date: "2023-10-01",
        title: "Battery Technology Breakthrough",
        content:
          "Our engineering team has achieved a significant breakthrough in battery technology ...",
      },
    ],
    specs: {
      range: "400 miles",
      acceleration: "0-60 mph in 4.5 seconds",
      topSpeed: "130 mph",
      batteryCapacity: "120 kWh",
      chargingTime: "30 minutes (10% to 80%)",
      solarGeneration: "Up to 25 miles per day",
    },
  };

  // Show either chain-based numbers or fallback
  const percentFunded =
    (Number(project.currentFunding) / Number(project.fundingGoal)) * 100 || 0;

  // Fund the project
  const handleFund = async () => {
    if (!fundAmount || isNaN(Number(fundAmount)) || Number(fundAmount) <= 0) return;
    if (!chainProject) {
      console.log("No chain project loaded. Cannot fund.");
      return;
    }

    setIsLoading(true);
    try {
      console.log(
        `Funding project #${chainProject.id} with amount ${fundAmount} ETH...`
      );
      await fundProject(String(chainProject.id), fundAmount);
      console.log("Funding transaction submitted.");
      setShowSuccess(true);
      setFundAmount("");
    } catch (error) {
      console.error("Funding error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Voting placeholders – your contract doesn't implement these
  const handleVote = async (requestId: string, vote: boolean) => {
    try {
      console.log(`Voting on request ${requestId}: ${vote ? "Yes" : "No"}`);
      await voteRequest(requestId, vote);
    } catch (error) {
      console.error("Voting error:", error);
    }
  };

  const handleFinalize = async (requestId: string) => {
    try {
      console.log(`Finalizing request ${requestId}`);
      await finalizeRequest(requestId);
    } catch (error) {
      console.error("Finalize error:", error);
    }
  };

  return (
    <div className="container px-4 py-12 md:px-6 md:py-16">
      <Link href="/projects" className="flex items-center text-sm mb-6 hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Project Details */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold tracking-tighter md:text-4xl mb-4">
            {project.title}
          </h1>
          <div className="relative aspect-video overflow-hidden rounded-lg mb-6">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <Tabs defaultValue="about">
            <TabsList className="mb-4">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="updates">Updates</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="voting">Voting</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-4">
              <p>{project.longDescription}</p>
            </TabsContent>

            <TabsContent value="updates" className="space-y-6">
              {project.updates.map((update, index) => (
                <div key={index} className="border-l-4 border-primary pl-4">
                  <p className="text-sm text-gray-500">{update.date}</p>
                  <h3 className="font-bold text-lg">{update.title}</h3>
                  <p>{update.content}</p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="specs" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Range</p>
                  <p className="font-medium">{project.specs.range}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Acceleration</p>
                  <p className="font-medium">{project.specs.acceleration}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Top Speed</p>
                  <p className="font-medium">{project.specs.topSpeed}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Battery Capacity</p>
                  <p className="font-medium">{project.specs.batteryCapacity}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Charging Time</p>
                  <p className="font-medium">{project.specs.chargingTime}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Solar Generation</p>
                  <p className="font-medium">{project.specs.solarGeneration}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-3">
                {project.team.map((member, index) => (
                  <div key={index} className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-3 overflow-hidden rounded-full">
                      <Image
                        src={member.image || "/placeholder.svg"}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-bold">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="voting" className="space-y-6">
              {votingRequests.length === 0 ? (
                <p>No voting requests available.</p>
              ) : (
                votingRequests.map((req) => {
                  const isExpired = new Date(req.votingDeadline) < new Date();
                  const votesForPercentage = (req.votesFor / req.totalVotingPower) * 100;
                  const votesAgainstPercentage = (req.votesAgainst / req.totalVotingPower) * 100;

                  return (
                    <div key={req.id} className="border p-4 rounded-md space-y-2">
                      <p className="text-sm text-gray-500">Request ID: {req.id}</p>
                      <h3 className="font-bold text-lg">{req.description}</h3>
                      <p>Amount: {req.amount} ETH</p>
                      <p>Recipient: {req.recipient}</p>
                      <p>
                        Voting Deadline: {new Date(req.votingDeadline).toLocaleString()}
                        {isExpired && " (Expired)"}
                      </p>
                      <div className="mt-4">
                        <div className="flex justify-between mb-1">
                          <span>Yes: {votesForPercentage.toFixed(1)}%</span>
                          <span>No: {votesAgainstPercentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${votesForPercentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex space-x-4">
                        <Button variant="outline" onClick={() => handleVote(req.id, true)}>
                          Vote Yes
                        </Button>
                        <Button variant="outline" onClick={() => handleVote(req.id, false)}>
                          Vote No
                        </Button>
                        {address === project.owner && isExpired && !req.executed && (
                          <Button variant="default" onClick={() => handleFinalize(req.id)}>
                            Finalize Request
                          </Button>
                        )}
                      </div>
                      <div className="mt-2">
                        <p>Votes For: {req.votesFor}</p>
                        <p>Votes Against: {req.votesAgainst}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Funding Sidebar */}
        <div>
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-2xl">
                    ${(project.currentFunding / 1000).toFixed(1)}k
                  </span>
                  <span className="text-gray-500">
                    of ${(project.fundingGoal / 1000).toFixed(0)}k goal
                  </span>
                </div>
                <Progress value={percentFunded} className="h-2" />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex justify-center mb-1">
                    <Users className="h-5 w-5 text-gray-500" />
                  </div>
                  <p className="font-bold">{project.backers.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Backers</p>
                </div>
                <div>
                  <div className="flex justify-center mb-1">
                    <Clock className="h-5 w-5 text-gray-500" />
                  </div>
                  <p className="font-bold">{project.daysLeft}</p>
                  <p className="text-xs text-gray-500">Days Left</p>
                </div>
                <div>
                  <div className="flex justify-center mb-1">
                    <Battery className="h-5 w-5 text-gray-500" />
                  </div>
                  <p className="font-bold">{percentFunded.toFixed(0)}%</p>
                  <p className="text-xs text-gray-500">Funded</p>
                </div>
              </div>

              <Separator />

              {!isConnected ? (
                <div className="space-y-4">
                  <p className="text-center text-sm">
                    Connect your wallet to fund this project
                  </p>
                  <ConnectWallet className="w-full" />
                </div>
              ) : showSuccess ? (
                <div className="bg-green-50 p-4 rounded-lg text-center space-y-2">
                  <h3 className="font-bold text-green-700">
                    Thank you for your contribution!
                  </h3>
                  <p className="text-sm text-green-600">
                    Your transaction has been submitted to the Scroll testnet.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => setShowSuccess(false)}
                  >
                    Fund Again
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Contribution Amount (ETH)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.1"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleFund}
                    disabled={isLoading || !fundAmount}
                  >
                    {isLoading ? "Processing..." : "Fund This Project"}
                  </Button>
                  <p className="text-xs text-center text-gray-500">
                    Funds are processed on the Scroll testnet. You'll receive a confirmation
                    once the transaction is complete.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
