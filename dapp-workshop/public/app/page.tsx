import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Battery, ChevronRight, Leaf, Zap } from "lucide-react"
import ProjectCard from "@/components/project-card"
import ConnectWallet from "@/components/connect-wallet"

export default function Home() {
  // Sample featured projects data
  const featuredProjects = [
    {
      id: "1",
      title: "SolarDrive EV",
      description: "Solar-powered electric vehicle with 400 mile range",
      image: "/product_solardrive3.webp?height=200&width=400",
      fundingGoal: 500000,
      currentFunding: 325000,
      daysLeft: 15,
      backers: 1240,
    },
    {
      id: "2",
      title: "EcoRide City",
      description: "Affordable urban electric vehicle with swappable batteries",
      image: "/images.jpeg",
      fundingGoal: 250000,
      currentFunding: 175000,
      daysLeft: 21,
      backers: 890,
    },
    {
      id: "3",
      title: "HyperCharge SUV",
      description: "Family-sized EV with ultra-fast charging capabilities",
      image: "/imageS2.jpeg",
      fundingGoal: 750000,
      currentFunding: 450000,
      daysLeft: 30,
      backers: 1560,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Crowdfund the Future of Electric Vehicles
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Support innovative EV projects and be part of the sustainable transportation revolution. Powered by
                Scroll blockchain technology.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link href="/projects">Explore Projects</Link>
              </Button>
              <ConnectWallet />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 items-stretch">
            <Card className="flex flex-col">
              <CardHeader>
                <Leaf className="w-10 h-10 text-green-500 mb-4" />
                <CardTitle>Sustainable Innovation</CardTitle>
                <CardDescription>
                  Support projects that are pushing the boundaries of sustainable transportation technology.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <Battery className="w-10 h-10 text-blue-500 mb-4" />
                <CardTitle>Blockchain Transparency</CardTitle>
                <CardDescription>
                  All funding is managed transparently on the Scroll testnet blockchain, ensuring accountability.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <Zap className="w-10 h-10 text-yellow-500 mb-4" />
                <CardTitle>Community Powered</CardTitle>
                <CardDescription>
                  Join a community of EV enthusiasts and investors shaping the future of transportation.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="w-full py-12 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Featured Projects</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Discover innovative EV projects seeking funding from our community.
              </p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Button asChild variant="outline">
              <Link href="/projects" className="flex items-center">
                View All Projects <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">How It Works</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Our platform makes it easy to support EV innovation using blockchain technology.
              </p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3 lg:gap-12 mt-8">
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">1</div>
              <h3 className="text-xl font-bold">Connect Your Wallet</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Connect your Ethereum wallet to interact with the Scroll testnet.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">2</div>
              <h3 className="text-xl font-bold">Choose a Project</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Browse innovative EV projects and select one that aligns with your interests.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">3</div>
              <h3 className="text-xl font-bold">Fund & Track</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Contribute funds using cryptocurrency and track the project's progress transparently.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

