"use client"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import type { Profile, Project, BlogPost, Technology, Experience } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LogOut, Plus, Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { ProfileForm } from "@/components/profile-form"
import { ProjectForm } from "@/components/project-form"
import { BlogForm } from "@/components/blog-form"
import { TechnologyForm } from "@/components/technology-form"
import { ExperienceForm } from "@/components/experience-form"

interface AdminDashboardProps {
  user: User
  onSignOut: () => void
}

export function AdminDashboard({ user, onSignOut }: AdminDashboardProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [technologies, setTechnologies] = useState<Technology[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [activeForm, setActiveForm] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const [profileRes, projectsRes, blogPostsRes, technologiesRes, experiencesRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("projects").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("blog_posts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("technologies").select("*").eq("user_id", user.id).order("name"),
        supabase.from("experiences").select("*").eq("user_id", user.id).order("start_date", { ascending: false }),
      ])

      setProfile(profileRes.data)
      setProjects(projectsRes.data || [])
      setBlogPosts(blogPostsRes.data || [])
      setTechnologies(technologiesRes.data || [])
      setExperiences(experiencesRes.data || [])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (table: string, id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return

    try {
      const { error } = await supabase.from(table).delete().eq("id", id)
      if (error) throw error
      loadData()
    } catch (error) {
      console.error("Error deleting item:", error)
      alert("Error deleting item")
    }
  }

  const handleFormSuccess = () => {
    setActiveForm(null)
    setEditingItem(null)
    loadData()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Portfolio Admin</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/" target="_blank">
                <Eye className="h-4 w-4 mr-2" />
                View Site
              </Link>
            </Button>
            <Button variant="outline" onClick={onSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="technologies">Technologies</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Profile</h2>
              <Button onClick={() => setActiveForm("profile")}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            {profile ? (
              <Card>
                <CardHeader>
                  <CardTitle>{profile.name}</CardTitle>
                  <CardDescription>{profile.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{profile.bio}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Email:</strong> {profile.email}
                    </div>
                    <div>
                      <strong>GitHub:</strong> {profile.github_url}
                    </div>
                    <div>
                      <strong>LinkedIn:</strong> {profile.linkedin_url}
                    </div>
                    <div>
                      <strong>Website:</strong> {profile.website_url}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="mb-4">No profile found. Create your profile to get started.</p>
                  <Button onClick={() => setActiveForm("profile")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Profile
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeForm === "profile" && (
              <ProfileForm
                profile={profile}
                userId={user.id}
                onSuccess={handleFormSuccess}
                onCancel={() => setActiveForm(null)}
              />
            )}
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Projects</h2>
              <Button onClick={() => setActiveForm("project")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingItem(project)
                            setActiveForm("project")
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete("projects", project.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies?.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {project.featured && <Badge variant="default">Featured</Badge>}
                      <Badge variant="outline">{project.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {activeForm === "project" && (
              <ProjectForm
                project={editingItem}
                userId={user.id}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setActiveForm(null)
                  setEditingItem(null)
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="blog" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Blog Posts</h2>
              <Button onClick={() => setActiveForm("blog")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Post
              </Button>
            </div>

            <div className="space-y-4">
              {blogPosts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{post.title}</CardTitle>
                        <CardDescription>{post.excerpt}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingItem(post)
                            setActiveForm("blog")
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete("blog_posts", post.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Badge variant={post.published ? "default" : "secondary"}>
                        {post.published ? "Published" : "Draft"}
                      </Badge>
                      <div className="flex flex-wrap gap-2">
                        {post.tags?.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {activeForm === "blog" && (
              <BlogForm
                post={editingItem}
                userId={user.id}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setActiveForm(null)
                  setEditingItem(null)
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="technologies" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Technologies</h2>
              <Button onClick={() => setActiveForm("technology")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Technology
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {technologies.map((tech) => (
                <Card key={tech.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{tech.name}</CardTitle>
                        <CardDescription className="capitalize">{tech.category}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingItem(tech)
                            setActiveForm("technology")
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete("technologies", tech.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Proficiency:</span>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${
                              i < (tech.proficiency || 0) ? "bg-primary" : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {activeForm === "technology" && (
              <TechnologyForm
                technology={editingItem}
                userId={user.id}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setActiveForm(null)
                  setEditingItem(null)
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="experience" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Experience</h2>
              <Button onClick={() => setActiveForm("experience")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Experience
              </Button>
            </div>

            <div className="space-y-4">
              {experiences.map((exp) => (
                <Card key={exp.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{exp.position}</CardTitle>
                        <CardDescription>
                          {exp.company} • {exp.location}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingItem(exp)
                            setActiveForm("experience")
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete("experiences", exp.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-2">
                      <Badge variant={exp.current ? "default" : "secondary"}>{exp.current ? "Current" : "Past"}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {exp.start_date} - {exp.current ? "Present" : exp.end_date}
                      </span>
                    </div>
                    {exp.description && <p className="text-sm text-muted-foreground">{exp.description}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>

            {activeForm === "experience" && (
              <ExperienceForm
                experience={editingItem}
                userId={user.id}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setActiveForm(null)
                  setEditingItem(null)
                }}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
