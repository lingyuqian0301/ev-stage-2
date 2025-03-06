"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Battery, Clock, Users } from "lucide-react"
import { fundProject } from "@/lib/blockchain"
import ConnectWallet from "@/components/connect-wallet"
import { useAccount } from "wagmi"

export default function ProjectDetailPage() {
  const { id } = useParams()
  const { isConnected } = useAccount()
  const [fundAmount, setFundAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Mock project data - in a real app, this would be fetched based on the ID
  const project = {
    id: id as string,
    title: "SolarDrive EV",
    description: "Solar-powered electric vehicle with 400 mile range",
    longDescription:
      "The SolarDrive EV represents the next generation of sustainable transportation. Featuring integrated solar panels on the roof, hood, and trunk, this vehicle can generate up to 25 miles of range per day from solar power alone. With a high-capacity 120kWh battery pack, the SolarDrive achieves an impressive 400-mile range on a single charge. The vehicle also features bidirectional charging capabilities, allowing it to power homes during outages or sell energy back to the grid during peak hours.",
    image: "/product_solardrive3.webp?height=200&width=400",
    fundingGoal: 500000,
    currentFunding: 325000,
    daysLeft: 15,
    backers: 1240,
    team: [
      { name: "Elena Rodriguez", role: "Founder & CEO", image: "/placeholder.svg?height=100&width=100" },
      { name: "Michael Chen", role: "CTO", image: "/placeholder.svg?height=100&width=100" },
      { name: "Sarah Johnson", role: "Lead Engineer", image: "/placeholder.svg?height=100&width=100" },
    ],
    updates: [
      {
        date: "2023-11-15",
        title: "Production Prototype Completed",
        content:
          "We're excited to announce that we've completed our production prototype and it has exceeded our performance expectations in initial testing.",
      },
      {
        date: "2023-10-01",
        title: "Battery Technology Breakthrough",
        content:
          "Our engineering team has achieved a significant breakthrough in battery technology, improving energy density by 15%.",
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
  }

  const handleFund = async () => {
    if (!fundAmount || isNaN(Number(fundAmount)) || Number(fundAmount) <= 0) return

    setIsLoading(true)
    try {
      await fundProject(project.id, Number(fundAmount))
      setShowSuccess(true)
      setFundAmount("")
    } catch (error) {
      console.error("Funding error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const percentFunded = (project.currentFunding / project.fundingGoal) * 100

  return (
    <div className="container px-4 py-12 md:px-6 md:py-16">
      <Link href="/projects" className="flex items-center text-sm mb-6 hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Project Details */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold tracking-tighter md:text-4xl mb-4">{project.title}</h1>
          <div className="relative aspect-video overflow-hidden rounded-lg mb-6">
            <Image
              src={project.image || "/product_solardrive3.webp?height=200&width=400"}
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
                      <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                    </div>
                    <h3 className="font-bold">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.role}</p>
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
                  <span className="font-bold text-2xl">${(project.currentFunding / 1000).toFixed(1)}k</span>
                  <span className="text-gray-500">of ${(project.fundingGoal / 1000).toFixed(0)}k goal</span>
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
                  <p className="text-center text-sm">Connect your wallet to fund this project</p>
                  <ConnectWallet className="w-full" />
                </div>
              ) : showSuccess ? (
                <div className="bg-green-50 p-4 rounded-lg text-center space-y-2">
                  <h3 className="font-bold text-green-700">Thank you for your contribution!</h3>
                  <p className="text-sm text-green-600">Your transaction has been submitted to the Scroll testnet.</p>
                  <Button variant="outline" className="mt-2" onClick={() => setShowSuccess(false)}>
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
                  <Button className="w-full" onClick={handleFund} disabled={isLoading || !fundAmount}>
                    {isLoading ? "Processing..." : "Fund This Project"}
                  </Button>
                  <p className="text-xs text-center text-gray-500">
                    Funds are processed on the Scroll testnet. You'll receive a confirmation once the transaction is
                    complete.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

