import { supabase } from "@/lib/supabase"
import type { BlogPost } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getSiteSettings } from "@/lib/auth-utils"

async function getBlogPosts() {
  // Get site settings to determine primary user
  const siteSettings = await getSiteSettings()

  let userFilter = { published: true }
  if (siteSettings?.single_user_mode && siteSettings.primary_user_id) {
    userFilter = { ...userFilter, user_id: siteSettings.primary_user_id }
  }

  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .match(userFilter)
    .order("created_at", { ascending: false })

  return data as BlogPost[]
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            className="hover:bg-purple-600 hover:text-white transition-colors"
            asChild
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Blog
          </h1>
        </div>

        <div className="space-y-8">
          {posts?.map((post) => (
            <Card
              key={post.id}
              className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="md:flex">
                {post.image_url && (
                  <div className="md:w-1/3">
                    <div className="aspect-video md:aspect-square relative overflow-hidden">
                      <Image
                        src={post.image_url || "/placeholder.svg"}
                        alt={post.title}
                        fill
                        className="object-cover rounded-l-lg hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                )}
                <div className={post.image_url ? "md:w-2/3" : "w-full"}>
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-900">{post.title}</CardTitle>
                    <CardDescription className="text-base text-slate-600">{post.excerpt}</CardDescription>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(post.created_at!).toLocaleDateString()}
                      </div>
                    </div>
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
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      asChild
                    >
                      <Link href={`/blog/${post.slug}`}>Read More</Link>
                    </Button>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {!posts ||
          (posts.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 shadow-lg">
                <p className="text-slate-600">No blog posts found.</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
