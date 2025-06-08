import { supabase } from "@/lib/supabase"
import type { Profile, Project, BlogPost, Technology, Experience } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Linkedin, Twitter, Globe, ExternalLink, Mail, MapPin, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

async function getPortfolioData() {
  const [profileRes, projectsRes, blogPostsRes, technologiesRes, experiencesRes] = await Promise.all([
    supabase.from("profiles").select("*").limit(1).single(),
    supabase.from("projects").select("*").order("created_at", { ascending: false }),
    supabase.from("blog_posts").select("*").eq("published", true).order("created_at", { ascending: false }).limit(3),
    supabase.from("technologies").select("*").order("proficiency", { ascending: false }),
    supabase.from("experiences").select("*").order("start_date", { ascending: false }),
  ])

  return {
    profile: profileRes.data as Profile,
    projects: projectsRes.data as Project[],
    blogPosts: blogPostsRes.data as BlogPost[],
    technologies: technologiesRes.data as Technology[],
    experiences: experiencesRes.data as Experience[],
  }
}

export default async function Portfolio() {
  const { profile, projects, blogPosts, technologies, experiences } = await getPortfolioData()

  const featuredProjects = projects?.filter((p) => p.featured) || []
  const techByCategory =
    technologies?.reduce(
      (acc, tech) => {
        const category = tech.category || "other"
        if (!acc[category]) acc[category] = []
        acc[category].push(tech)
        return acc
      },
      {} as Record<string, Technology[]>,
    ) || {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-4xl mx-auto">
          <Avatar className="w-32 h-32 mx-auto mb-6 ring-4 ring-white shadow-xl">
            <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.name} />
            <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {profile?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
            {profile?.name}
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-6 font-medium">{profile?.title}</p>
          <p className="text-lg max-w-2xl mx-auto mb-8 text-slate-600 leading-relaxed">{profile?.bio}</p>

          <div className="flex justify-center gap-4 mb-8">
            {profile?.github_url && (
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-gray-900 hover:text-white transition-colors"
                asChild
              >
                <Link href={profile.github_url} target="_blank">
                  <Github className="h-5 w-5" />
                </Link>
              </Button>
            )}
            {profile?.linkedin_url && (
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-blue-600 hover:text-white transition-colors"
                asChild
              >
                <Link href={profile.linkedin_url} target="_blank">
                  <Linkedin className="h-5 w-5" />
                </Link>
              </Button>
            )}
            {profile?.twitter_url && (
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-sky-500 hover:text-white transition-colors"
                asChild
              >
                <Link href={profile.twitter_url} target="_blank">
                  <Twitter className="h-5 w-5" />
                </Link>
              </Button>
            )}
            {profile?.website_url && (
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-emerald-600 hover:text-white transition-colors"
                asChild
              >
                <Link href={profile.website_url} target="_blank">
                  <Globe className="h-5 w-5" />
                </Link>
              </Button>
            )}
            {profile?.email && (
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-red-500 hover:text-white transition-colors"
                asChild
              >
                <Link href={`mailto:${profile.email}`}>
                  <Mail className="h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>

          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            asChild
          >
            <Link href="#projects">View My Work</Link>
          </Button>
        </div>
      </section>

      {/* Featured Projects */}
      <section id="projects" className="py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Featured Projects
          </h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            Here are some of my favorite projects that showcase my skills and passion for development.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project) => (
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
                  <CardTitle className="text-gray-900">{project.title}</CardTitle>
                  <CardDescription className="text-slate-600">{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies?.map((tech) => (
                      <Badge key={tech} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
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
                      <Button size="sm" variant="outline" className="hover:bg-gray-900 hover:text-white" asChild>
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

          {projects && projects.length > featuredProjects.length && (
            <div className="text-center mt-12">
              <Button variant="outline" className="hover:bg-blue-600 hover:text-white transition-colors" asChild>
                <Link href="/projects">View All Projects</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Technologies */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Technologies & Skills
          </h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            The tools and technologies I use to bring ideas to life.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(techByCategory).map(([category, techs]) => (
              <Card
                key={category}
                className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
              >
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardTitle className="capitalize text-gray-900">{category}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {techs.map((tech) => (
                      <div
                        key={tech.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        {tech.icon_url && (
                          <Image
                            src={tech.icon_url || "/placeholder.svg"}
                            alt={tech.name}
                            width={24}
                            height={24}
                            className="rounded"
                          />
                        )}
                        <span className="flex-1 font-medium text-gray-900">{tech.name}</span>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                i < (tech.proficiency || 0)
                                  ? "bg-gradient-to-r from-blue-500 to-purple-500"
                                  : "bg-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Experience
          </h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            My professional journey and the experiences that shaped my career.
          </p>
          <div className="space-y-8">
            {experiences?.map((exp, index) => (
              <Card
                key={exp.id}
                className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-gray-900">{exp.position}</CardTitle>
                      <CardDescription className="text-lg font-medium text-blue-600">{exp.company}</CardDescription>
                    </div>
                    <Badge
                      variant={exp.current ? "default" : "secondary"}
                      className={exp.current ? "bg-gradient-to-r from-emerald-500 to-teal-600" : ""}
                    >
                      {exp.current ? "Current" : "Past"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {exp.start_date} - {exp.current ? "Present" : exp.end_date}
                    </div>
                    {exp.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {exp.location}
                      </div>
                    )}
                  </div>
                  {exp.description && <p className="text-slate-700 leading-relaxed">{exp.description}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Blog Posts */}
      {blogPosts && blogPosts.length > 0 && (
        <section className="py-20 px-4 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Recent Blog Posts
            </h2>
            <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
              Thoughts, tutorials, and insights from my development journey.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <Card
                  key={post.id}
                  className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
                >
                  {post.image_url && (
                    <div className="aspect-video relative overflow-hidden">
                      <Image
                        src={post.image_url || "/placeholder.svg"}
                        alt={post.title}
                        fill
                        className="object-cover rounded-t-lg hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-gray-900">{post.title}</CardTitle>
                    <CardDescription className="text-slate-600">{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags?.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="border-purple-200 text-purple-700 hover:bg-purple-50"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-purple-600 hover:text-white transition-colors"
                      asChild
                    >
                      <Link href={`/blog/${post.slug}`}>Read More</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button variant="outline" className="hover:bg-purple-600 hover:text-white transition-colors" asChild>
                <Link href="/blog">View All Posts</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-600 mb-4">Built with Next.js, Tailwind CSS, and Supabase</p>
          <div className="flex justify-center gap-4">
            <Button variant="ghost" size="sm" className="hover:bg-slate-100" asChild>
              <Link href="/admin">Admin</Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
