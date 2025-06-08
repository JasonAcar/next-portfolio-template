import { supabase } from "./supabase"

export interface SiteSettings {
  id: string
  single_user_mode: boolean
  primary_user_id: string | null
  site_name: string
  created_at: string
  updated_at: string
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase.from("site_settings").select("*").limit(1).single()

  if (error) {
    console.error("Error fetching site settings:", error)
    return null
  }

  return data
}

export async function isRegistrationAllowed(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("is_registration_allowed")

    if (error) {
      console.error("Error checking registration status:", error)
      return false
    }

    return data
  } catch (error) {
    console.error("Error checking registration status:", error)
    return false
  }
}

export async function getUserCount(): Promise<number> {
  try {
    // Count profiles instead of auth.users since we can't directly query auth.users
    const { count, error } = await supabase.from("profiles").select("*", { count: "exact", head: true })

    if (error) {
      console.error("Error counting users:", error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error("Error counting users:", error)
    return 0
  }
}
