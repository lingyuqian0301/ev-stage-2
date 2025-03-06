import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, Users } from "lucide-react"

interface ProjectCardProps {
  project: {
    id: string
    title: string
    description: string
    image: string
    fundingGoal: number
    currentFunding: number
    daysLeft: number
    backers: number
  }
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const percentFunded = (project.currentFunding / project.fundingGoal) * 100

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="relative aspect-video">
          <Image src={project.image || "/placeholder.svg"} alt={project.title} fill className="object-cover" />
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-1">{project.title}</h3>
          <p className="text-sm text-gray-500 mb-4">{project.description}</p>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">${(project.currentFunding / 1000).toFixed(1)}k</span>
              <span className="text-gray-500">${(project.fundingGoal / 1000).toFixed(0)}k</span>
            </div>
            <Progress value={percentFunded} className="h-2" />
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between text-sm">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{project.backers.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{project.daysLeft} days left</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

