import { supabase } from "@/lib/supabase"
import type { BlogPost } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getSiteSettings } from "@/lib/auth-utils"

async function getBlogPost(slug: string) {
  // Get site settings to determine primary user
  const siteSettings = await getSiteSettings()

  let userFilter = { slug, published: true }
  if (siteSettings?.single_user_mode && siteSettings.primary_user_id) {
    userFilter = { ...userFilter, user_id: siteSettings.primary_user_id }
  }

  const { data } = await supabase.from("blog_posts").select("*").match(userFilter).single()

  return data as BlogPost
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" asChild>
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="text-muted-foreground">Back to Blog</span>
        </div>

        <article>
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>

            <div className="flex items-center gap-4 text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(post.created_at!).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags?.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            {post.image_url && (
              <div className="aspect-video relative mb-8 rounded-lg overflow-hidden">
                <Image src={post.image_url || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
              </div>
            )}
          </header>

          <div className="prose prose-lg max-w-none">
            {post.content?.split("\n").map((paragraph, index) => {
              if (paragraph.startsWith("# ")) {
                return (
                  <h1 key={index} className="text-3xl font-bold mt-8 mb-4">
                    {paragraph.slice(2)}
                  </h1>
                )
              }
              if (paragraph.startsWith("## ")) {
                return (
                  <h2 key={index} className="text-2xl font-bold mt-6 mb-3">
                    {paragraph.slice(3)}
                  </h2>
                )
              }
              if (paragraph.startsWith("### ")) {
                return (
                  <h3 key={index} className="text-xl font-bold mt-4 mb-2">
                    {paragraph.slice(4)}
                  </h3>
                )
              }
              if (paragraph.trim() === "") {
                return <br key={index} />
              }
              return (
                <p key={index} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              )
            })}
          </div>
        </article>
      </div>
    </div>
  )
}
