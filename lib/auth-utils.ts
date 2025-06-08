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
  try {
    const { data, error } = await supabase.from("site_settings").select("*").limit(1).single()

    if (error) {
      console.error("Error fetching site settings:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error fetching site settings:", error)
    return null
  }
}

export async function isRegistrationAllowed(): Promise<boolean> {
  try {
    // Use the database function for consistent logic
    const { data, error } = await supabase.rpc("is_registration_allowed")

    if (error) {
      console.error("Error checking registration status:", error)
      // Fallback: check profile count directly
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true })
      return (count || 0) === 0
    }

    return data
  } catch (error) {
    console.error("Error checking registration status:", error)
    // If there's an error, allow registration (fail open)
    return true
  }
}

export async function getUserCount(): Promise<number> {
  try {
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

export async function hasSampleData(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("name", "John Doe")
      .like("email", "%example.com%")
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error checking for sample data:", error)
      return false
    }

    return !!data
  } catch (error) {
    console.error("Error checking for sample data:", error)
    return false
  }
}

export async function createUserProfile(userId: string, email: string): Promise<any> {
  try {
    // Create a basic profile for the user
    const { data, error } = await supabase
      .from("profiles")
      .insert([
        {
          user_id: userId,
          name: email.split("@")[0], // Use email prefix as default name
          email: email,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating user profile:", error)
      throw error
    }

    console.log("Profile created successfully:", data)
    return data
  } catch (error) {
    console.error("Error creating user profile:", error)
    throw error
  }
}

// Helper function to check if user has a profile
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" error, which is expected if no profile exists
      console.error("Error fetching user profile:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
}

// Helper function to ensure user has a profile (create if missing)
export async function ensureUserProfile(userId: string, email: string) {
  try {
    const existingProfile = await getUserProfile(userId)

    if (!existingProfile) {
      console.log("No profile found, creating one for user:", userId)
      return await createUserProfile(userId, email)
    }

    console.log("Profile already exists for user:", userId)
    return existingProfile
  } catch (error) {
    console.error("Error ensuring user profile:", error)
    throw error
  }
}
