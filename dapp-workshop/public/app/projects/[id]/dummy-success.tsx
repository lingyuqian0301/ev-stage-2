"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Battery, Clock, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import ConnectWallet from "@/components/connect-wallet";

// This entire file is dummy - no real blockchain calls
// Just a "successfully funded" example

export default function DummySuccessPage() {
  // Optional UI states
  const [fundAmount, setFundAmount] = useState("");
  const [isFunding, setIsFunding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // This project is 110% funded (330k out of 300k)
  // And 0 days left to indicate success/closed
  const project = {
    id: "dummy-success",
    title: "JetCharge Roadster",
    description: "An electric roadster with a top speed of 200 mph",
    longDescription:
      "The JetCharge Roadster is fully funded! Combining advanced battery technology with aerodynamic design, it delivers unmatched speed and efficiency. Now that the crowdfunding goal is exceeded, production can begin ahead of schedule. Stay tuned for more updates on shipping timelines and future test drives.",
    image: "/placeholder.svg?height=200&width=400",
    fundingGoal: 300000,
    currentFunding: 330000, // 110%
    daysLeft: 0,
    backers: 2000,
    specs: {
      range: "400 miles",
      acceleration: "0-60 mph in 2.9 seconds",
      topSpeed: "200 mph",
      batteryCapacity: "100 kWh",
      chargingTime: "20 minutes (10% to 80%)",
    },
    team: [
      {
        name: "Ava Thompson",
        role: "Founder & CEO",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        name: "Leo Navarro",
        role: "CTO",
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
    updates: [
      {
        date: "2024-04-10",
        title: "Crowdfunding Goal Exceeded!",
        content:
          "Thanks to our amazing backers, we surpassed our funding goal ahead of schedule. Production is now moving forward at full speed!",
      },
    ],
  };

  // The project is 110% funded
  const percentFunded = (project.currentFunding / project.fundingGoal) * 100;

  // Dummy "Fund" logic
  const handleFund = () => {
    // Project is already fully funded – you could block further funding
    setIsFunding(true);
    setTimeout(() => {
      setIsFunding(false);
      setShowSuccess(true);
    }, 1000);
  };

  return (
    <div className="container px-4 py-12 md:px-6 md:py-16">
      {/* Link back to projects listing */}
      <Link href="/projects" className="flex items-center text-sm mb-6 hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main column */}
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

          {/* TABS */}
          <Tabs defaultValue="about">
            <TabsList className="mb-4">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="updates">Updates</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-4">
              <p>{project.longDescription}</p>
            </TabsContent>

            <TabsContent value="specs" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Range</p>
                  <p className="font-medium">{project.specs.range}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Acceleration</p>
                  <p className="font-medium">{project.specs.acceleration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Top Speed</p>
                  <p className="font-medium">{project.specs.topSpeed}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Battery Capacity</p>
                  <p className="font-medium">{project.specs.batteryCapacity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Charging Time</p>
                  <p className="font-medium">{project.specs.chargingTime}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {project.team.map((member, idx) => (
                  <div key={idx} className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-3 overflow-hidden rounded-full">
                      <Image
                        src={member.image}
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

            <TabsContent value="updates" className="space-y-6">
              {project.updates.map((upd, idx) => (
                <div key={idx} className="border-l-4 border-primary pl-4">
                  <p className="text-sm text-gray-500">{upd.date}</p>
                  <h3 className="font-bold text-lg">{upd.title}</h3>
                  <p>{upd.content}</p>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Funding Sidebar */}
        <div>
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Display the funding progress */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-2xl">
                    ${(project.currentFunding / 1000).toFixed(1)}k
                  </span>
                  <span className="text-gray-500">
                    of ${(project.fundingGoal / 1000).toFixed(1)}k goal
                  </span>
                </div>
                <Progress value={percentFunded} className="h-2" />
              </div>

              {/* Stats Row */}
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

              {/* UI for further funding */}
              <p className="text-sm text-center text-green-600 font-semibold">
                This project is already fully funded! (110%)
              </p>

              <div className="space-y-4">
                <div>
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
                  disabled={isFunding || !fundAmount}
                >
                  {isFunding ? "Processing..." : "Contribute Anyway"}
                </Button>
                {showSuccess && (
                  <p className="text-sm text-green-600 text-center mt-2">
                    Thanks for contributing even though it’s already fully funded!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
