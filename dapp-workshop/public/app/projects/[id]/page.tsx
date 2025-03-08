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

// We'll still import from your single `blockchain.ts` for demonstration
// But in a real scenario, you'd have separate files or real on-chain data
import {
  fundProject,
  getProjectStruct,
  getProjectFunding,
  getProjectBackers,
  // If you have getProjectCount etc.
} from "@/lib/blockchain";

import ConnectWallet from "@/components/connect-wallet";

// Define how we store project data in the frontend
interface ChainProject {
  id: number;
  owner: string;
  fundingGoal: number;     // Wei or raw integer
  currentFunding: number;  // ETH float from getProjectFunding
  backers: number;
  active: boolean;
  endDate: number;        // Add endDate to track project deadline
}

// For dummy voting requests with weight-based votes
interface VotingRequest {
  id: string;
  description: string;
  recipient: string;
  amount: number;
  votesFor: number;         // total sum of 'weight' from supporters
  votesAgainst: number;     // total sum of 'weight' from opponents
  totalVotingPower: number; // sum of all possible weights
  votingDeadline: string;
  executed: boolean;
}

// For storing top contributors
interface Contributor {
  address: string;
  amountFunded: number; // in ETH
}

export default function ProjectDetailPage() {
  // route param => e.g. /projects/chain-5
  const { id: idParam } = useParams();
  const id = idParam.replace("chain-", "");
  const { isConnected, address } = useAccount();

  // state for contribution input
  const [fundAmount, setFundAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

    //variable amount to store how much the user has funded
    const [amount, setAmount] = useState(0);

  // store the on-chain project data
  const [chainProject, setChainProject] = useState<ChainProject | null>(null);

  // Add local funding tracking
  const [localCurrentFunding, setLocalCurrentFunding] = useState<number>(0);

  // Dummy "requests" array for demonstration
  const [votingRequests, setVotingRequests] = useState<VotingRequest[]>([
    {
      id: "1",
      description: "Purchase EV charging equipment",
      recipient: "0xABC123",
      amount: 0.0001,
      votesFor: 0, // initially 0
      votesAgainst: 0, // initially 0
      totalVotingPower: 100, // e.g. sum of all contributions or arbitrary
      votingDeadline: new Date(Date.now() + 86400 * 1000).toISOString(),
      executed: false,
    },
    {
      id: "2",
      description: "Upgrade charging station software",
      recipient: "0xDEF456",
      amount: 0.00005,
      votesFor: 0,
      votesAgainst: 0,
      totalVotingPower: 100,
      votingDeadline: new Date(Date.now() + 86400 * 2000).toISOString(),
      executed: false,
    },
  ]);

  // Dummy map of each address => how much they funded
  // In a real scenario, you'd fetch from the contract or a subgraph
  const [contributors, setContributors] = useState<Contributor[]>([
    { address: "0x1111", amountFunded: 1.2 },
    { address: "0x2222", amountFunded: 5.8 },
    { address: "0x3333", amountFunded: 0.5 },
  ]);

  useEffect(() => {
    const fetchChainProject = async () => {
      if (!id) {
        console.log("No ID in route; cannot fetch project.");
        return;
      }

      const projectId = parseInt(id, 10);
      if (isNaN(projectId)) {
        console.log("Route param invalid:", id);
        return;
      }

      try {
        console.log("Fetching chain data for projectId =", projectId);
        const structData = await getProjectStruct(projectId);
        console.log("structData =>", structData);

        const funding = await getProjectFunding(projectId);
        console.log("currentFunding =>", funding);

        const totalBackers = await getProjectBackers(projectId);
        console.log("backers =>", totalBackers);

        setChainProject({
          id: structData.id,
          owner: structData.owner,
          fundingGoal: structData.fundingGoal,
          currentFunding: Number(funding) * 1e18,
          backers: totalBackers,
          active: structData.active,
          endDate: structData.endDate,
        });
      } catch (error) {
        console.error("Error fetching project from chain:", error);
      }
    };

    fetchChainProject();
  }, [id]);

  useEffect(() => {
    if (id.startsWith('dummy-')) {
      // Set initial funding for dummy project
      setLocalCurrentFunding(325000 * 1e18); // Initial dummy funding
    } else if (chainProject) {
      setLocalCurrentFunding(chainProject.currentFunding);
    }
  }, [chainProject, id]);

  // Calculate days left
  const calculateDaysLeft = () => {
    if (!chainProject?.endDate) return 0;
    
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const timeLeft = chainProject.endDate - now;
    const daysLeft = Math.max(0, Math.ceil(timeLeft / (24 * 60 * 60)));
    
    return daysLeft;
  };

  // Build a "UI project" with fallback
  const project = {
    id: id || "N/A",
    title: "SolarDrive EV",
    owner: chainProject?.owner || "0xOwnerAddress",
    description: "Solar-powered electric vehicle with 400 mile range",
    longDescription:
      "The SolarDrive EV represents the next generation of sustainable transportation...",
    image: "/product_solardrive3.webp?height=200&width=400",
    fundingGoal: chainProject ? Number(chainProject.fundingGoal) / 1e18 : 500000,
    currentFunding: localCurrentFunding / 1e18, // Use local tracking instead
    daysLeft: calculateDaysLeft(),
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
        content: "We've completed our production prototype ...",
      },
      {
        date: "2023-10-01",
        title: "Battery Technology Breakthrough",
        content: "Engineering team improved energy density by 15% ...",
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

  const percentFunded =
    (Number(project.currentFunding) / Number(project.fundingGoal)) * 100 || 0;

  // handle funding
  const handleFund = async () => {
    if (!fundAmount || isNaN(Number(fundAmount)) || Number(fundAmount) <= 0) {
      return;
    }

    setIsLoading(true);
    try {
      if (id.startsWith('dummy-')) {
        await fundProject("1", fundAmount);
        setLocalCurrentFunding(prev => prev + (Number(fundAmount) * 1e18));
        setAmount(prev => prev + Number(fundAmount));
        setShowSuccess(true);
        setFundAmount("");
        return;
      }

      if (!chainProject) {
        console.log("No chain project loaded; cannot fund.");
        return;
      }

      await fundProject(String(chainProject.id), fundAmount);
      setLocalCurrentFunding(prev => prev + (Number(fundAmount) * 1e18));
      setAmount(prev => prev + Number(fundAmount));
      setShowSuccess(true);
      setFundAmount("");
    } catch (error) {
      console.error("Funding error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Vote weighting logic:
  const handleVote = async (requestId: string, yes: boolean) => {
    if (!isConnected || !address) {
      console.log("Wallet not connected");
      return;
    }

    try {
      console.log(`Voting on request #${requestId}, yes=${yes}`);
      
      // Find the user's contribution weight
      const userWeight = amount; // Use the tracked contribution amount

      // Update voting state
      setVotingRequests((prev) =>
        prev.map((req) => {
          if (req.id === requestId) {
            if (yes) {
              req.votesFor += userWeight;
            } else {
              req.votesAgainst += userWeight;
            }
            return { ...req };
          }
          return req;
        })
      );

      // If it's a dummy project, interact with project 1
      if (id.startsWith('dummy-')) {
        // You would call your voting contract method here
        // await voteOnRequest("1", requestId, yes);
        console.log(`Dummy vote recorded for project 1, request ${requestId}`);
      } else {
        // For real chain projects
        // await voteOnRequest(chainProject.id, requestId, yes);
        console.log(`Vote recorded for project ${chainProject?.id}, request ${requestId}`);
      }

    } catch (error) {
      console.error("Voting error:", error);
    }
  };

  // Handle vote finalization
  const handleFinalize = async (requestId: string) => {
    try {
      if (id.startsWith('dummy-')) {
        // Interact with project 1 for dummy projects
        // await finalizeRequest("1", requestId);
        console.log(`Finalizing request ${requestId} for project 1`);
      } else {
        // await finalizeRequest(chainProject.id, requestId);
        console.log(`Finalizing request ${requestId} for project ${chainProject?.id}`);
      }

      // Update local state
      setVotingRequests((prev) =>
        prev.map((req) => {
          if (req.id === requestId) {
            return { ...req, executed: true };
          }
          return req;
        })
      );
    } catch (error) {
      console.error("Finalization error:", error);
    }
  };

  // Sort the contributors descending by "amountFunded"
  const sortedContributors = [...contributors].sort(
    (a, b) => b.amountFunded - a.amountFunded
  );

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
              <TabsTrigger value="ranking">Ranking</TabsTrigger>
            </TabsList>

            {/* About */}
            <TabsContent value="about" className="space-y-4">
              <p>{project.longDescription}</p>
            </TabsContent>

            {/* Updates */}
            <TabsContent value="updates" className="space-y-6">
              {project.updates.map((update, index) => (
                <div key={index} className="border-l-4 border-primary pl-4">
                  <p className="text-sm text-gray-500">{update.date}</p>
                  <h3 className="font-bold text-lg">{update.title}</h3>
                  <p>{update.content}</p>
                </div>
              ))}
            </TabsContent>

            {/* Specs */}
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

            {/* Team */}
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

            {/* Voting */}
            <TabsContent value="voting" className="space-y-6">
              {votingRequests.length === 0 ? (
                <p>No voting requests available.</p>
              ) : (
                votingRequests.map((req) => {
                  const isExpired = new Date(req.votingDeadline) < new Date();
                  // compute percentages
                  const totalVotes = req.votesFor + req.votesAgainst;
                  const votesForPerc =
                    totalVotes > 0 ? (req.votesFor / totalVotes) * 100 : 0;
                  const votesAgainstPerc =
                    totalVotes > 0 ? (req.votesAgainst / totalVotes) * 100 : 0;

                  return (
                    <div key={req.id} className="border p-4 rounded-md space-y-2">
                      <p className="text-sm text-gray-500">Request ID: {req.id}</p>
                      <h3 className="font-bold text-lg">{req.description}</h3>
                      <p>
                        Voting Deadline:{" "}
                        {new Date(req.votingDeadline).toLocaleString()}
                        {isExpired && " (Expired)"}
                      </p>

                      <div className="mt-4">
                        <div className="flex justify-between mb-1">
                          <span>Yes: {votesForPerc.toFixed(1)}%</span>
                          <span>No: {votesAgainstPerc.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${votesForPerc}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <Button
                          variant="outline"
                          onClick={() => handleVote(req.id, true)}
                        >
                          Vote Yes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleVote(req.id, false)}
                        >
                          Vote No
                        </Button>
                        {isExpired && !req.executed && (
                          <Button variant="default" onClick={() => handleFinalize(req.id)}>
                            Finalize Request
                          </Button>
                        )}
                      </div>

                      <div className="mt-2">
                        <p>Votes For: {req.votesFor.toFixed(2)}</p>
                        <p>Votes Against: {req.votesAgainst.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>

            {/* Ranking tab: show top addresses by amountFunded */}
            <TabsContent value="ranking" className="space-y-6">
              <h2 className="font-bold text-xl">Top Contributors</h2>
              <div className="border rounded-md p-4 space-y-2">
                {sortedContributors.map((c, idx) => (
                  <div key={c.address} className="flex justify-between">
                    <span>
                      #{idx + 1} {c.address}
                    </span>
                    <span>{c.amountFunded} ETH</span>
                  </div>
                ))}
              </div>
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
                    ${(project.currentFunding+amount*2500).toFixed(0)}
                  </span>
                  <span className="text-gray-500">
                    of ${(project.fundingGoal / 1000).toFixed(0)}k goal
                  </span>
                </div>
                <Progress
                  value={(project.currentFunding / project.fundingGoal) * 100}
                  className="h-2"
                />
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
                  <p className="font-bold">
                    {((project.currentFunding + amount*2500) / project.fundingGoal) * 100}%
                  </p>
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
                      //update amount variable
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