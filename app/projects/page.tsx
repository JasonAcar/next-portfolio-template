import { supabase } from "@/lib/supabase"
import type { Project } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, ExternalLink, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

async function getProjects() {
  const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false })

  return data as Project[]
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            className="hover:bg-blue-600 hover:text-white transition-colors"
            asChild
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            All Projects
          </h1>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects?.map((project) => (
            <Card
              key={project.id}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm"
            >
              {project.image_url && (
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src={project.image_url || "/placeholder.svg"}
                    alt={project.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-gray-900">{project.title}</CardTitle>
                    <CardDescription className="text-slate-600">{project.description}</CardDescription>
                  </div>
                  <Badge
                    variant={project.featured ? "default" : "secondary"}
                    className={project.featured ? "bg-gradient-to-r from-emerald-500 to-teal-600" : ""}
                  >
                    {project.featured ? "Featured" : project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {project.long_description && (
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">{project.long_description}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies?.map((tech) => (
                    <Badge key={tech} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                      {tech}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  {project.demo_url && (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                      asChild
                    >
                      <Link href={project.demo_url} target="_blank">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Demo
                      </Link>
                    </Button>
                  )}
                  {project.github_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="hover:bg-gray-900 hover:text-white transition-colors"
                      asChild
                    >
                      <Link href={project.github_url} target="_blank">
                        <Github className="h-4 w-4 mr-2" />
                        Code
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!projects ||
          (projects.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 shadow-lg">
                <p className="text-slate-600">No projects found.</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
