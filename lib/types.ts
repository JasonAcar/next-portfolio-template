export interface Profile {
  id: string
  user_id?: string
  name: string
  title?: string
  bio?: string
  email?: string
  github_url?: string
  linkedin_url?: string
  twitter_url?: string
  website_url?: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

export interface Project {
  id: string
  user_id?: string
  title: string
  description?: string
  long_description?: string
  image_url?: string
  demo_url?: string
  github_url?: string
  technologies?: string[]
  featured?: boolean
  status?: "completed" | "in-progress" | "planned"
  created_at?: string
  updated_at?: string
}

export interface BlogPost {
  id: string
  user_id?: string
  title: string
  slug: string
  excerpt?: string
  content?: string
  image_url?: string
  published?: boolean
  tags?: string[]
  created_at?: string
  updated_at?: string
}

export interface Technology {
  id: string
  user_id?: string
  name: string
  category?: string
  proficiency?: number
  icon_url?: string
  created_at?: string
}

export interface Experience {
  id: string
  user_id?: string
  company: string
  position: string
  description?: string
  start_date?: string
  end_date?: string
  current?: boolean
  location?: string
  created_at?: string
}

export interface Error {
  message: string
}
