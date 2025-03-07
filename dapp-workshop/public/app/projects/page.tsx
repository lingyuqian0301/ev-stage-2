"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectCard from "@/components/project-card";
import { Search } from "lucide-react";
import { getProjectDetails, getProjectFunding, getProjectBackers } from "@/lib/blockchain";

// Define the Project type
type Project = {
  id: string;
  title: string;
  description: string;
  image: string;
  fundingGoal: number;
  currentFunding: number;
  daysLeft: number;
  backers: number;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Sample dummy projects
  const dummyProjects: Project[] = [
    {
      id: "1",
      title: "SolarDrive EV",
      description: "Solar-powered electric vehicle with 400 mile range",
      image: "/placeholder.svg?height=200&width=400",
      fundingGoal: 500000,
      currentFunding: 325000,
      daysLeft: 15,
      backers: 1240,
    },
    {
      id: "2",
      title: "EcoRide City",
      description: "Affordable urban electric vehicle with swappable batteries",
      image: "/placeholder.svg?height=200&width=400",
      fundingGoal: 250000,
      currentFunding: 175000,
      daysLeft: 21,
      backers: 890,
    },
    {
      id: "3",
      title: "HyperCharge SUV",
      description: "Family-sized EV with ultra-fast charging capabilities",
      image: "/placeholder.svg?height=200&width=400",
      fundingGoal: 750000,
      currentFunding: 450000,
      daysLeft: 30,
      backers: 1560,
    },
    {
      id: "4",
      title: "MicroEV Commuter",
      description: "Compact electric vehicle designed for urban commuting",
      image: "/placeholder.svg?height=200&width=400",
      fundingGoal: 150000,
      currentFunding: 75000,
      daysLeft: 45,
      backers: 520,
    },
    {
      id: "5",
      title: "ElectroTruck Pro",
      description: "Heavy-duty electric pickup with exceptional towing capacity",
      image: "/placeholder.svg?height=200&width=400",
      fundingGoal: 1000000,
      currentFunding: 650000,
      daysLeft: 25,
      backers: 2100,
    },
    {
      id: "6",
      title: "EcoVan Delivery",
      description: "Electric delivery van with modular cargo system",
      image: "/placeholder.svg?height=200&width=400",
      fundingGoal: 400000,
      currentFunding: 180000,
      daysLeft: 35,
      backers: 780,
    },
  ];

  // Fetch projects from the blockchain
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Replace this with an actual contract call to retrieve the total number of projects
        const projectCount = 3; // e.g., from a function like: const projectCount = await getProjectCount();

        const blockchainProjects: Project[] = [];
        for (let i = 1; i <= projectCount; i++) {
          const projectDetails = await getProjectDetails(i);
          const funding = await getProjectFunding(i);
          const backers = await getProjectBackers(i);

          blockchainProjects.push({
            id: i.toString(),
            title: `Blockchain Project ${i}`,
            description: "A project funded on the blockchain",
            image: "/blockchain-placeholder.svg?height=200&width=400",
            fundingGoal: projectDetails.fundingGoal,
            currentFunding: funding,
            daysLeft: 30, // Placeholder for days left
            backers: backers,
          });
        }

        // Combine dummy and blockchain projects
        setProjects([...dummyProjects, ...blockchainProjects]);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return <div className="container px-4 py-12 md:px-6 md:py-16">Loading projects...</div>;
  }

  return (
    <div className="container px-4 py-12 md:px-6 md:py-16">
      <h1 className="text-3xl font-bold tracking-tighter md:text-4xl mb-8">Explore EV Projects</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input type="search" placeholder="Search projects..." className="pl-8" />
        </div>
        <Select defaultValue="newest">
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="funding">Most Funded</SelectItem>
            <SelectItem value="ending">Ending Soon</SelectItem>
            <SelectItem value="backers">Most Backers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Project Categories */}
      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="cars">Cars</TabsTrigger>
          <TabsTrigger value="trucks">Trucks & SUVs</TabsTrigger>
          <TabsTrigger value="commercial">Commercial</TabsTrigger>
          <TabsTrigger value="components">EV Components</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="cars" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 3).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="trucks" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(2, 5).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="commercial" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(5, 6).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="components" className="mt-6">
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 mb-4">No component projects available at the moment.</p>
            <Button variant="outline">Submit a Component Project</Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center mt-8">
        <Button variant="outline">Load More Projects</Button>
      </div>
    </div>
  );
}
