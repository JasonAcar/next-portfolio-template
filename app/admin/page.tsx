"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { isRegistrationAllowed, getUserCount, createUserProfile, getUserProfile, hasSampleData } from "@/lib/auth-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { User } from "@supabase/supabase-js"
import { AdminDashboard } from "@/components/admin-dashboard"
import { AlertCircle, Users, CheckCircle, Loader2, RefreshCw, Database } from "lucide-react"

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [registrationAllowed, setRegistrationAllowed] = useState(false)
  const [userCount, setUserCount] = useState(0)
  const [checkingRegistration, setCheckingRegistration] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [creatingProfile, setCreatingProfile] = useState(false)
  const [isSampleData, setIsSampleData] = useState(false)

  const checkRegistrationStatus = async () => {
    setCheckingRegistration(true)
    try {
      const [allowed, count, sampleData] = await Promise.all([isRegistrationAllowed(), getUserCount(), hasSampleData()])
      setRegistrationAllowed(allowed)
      setUserCount(count)
      setIsSampleData(sampleData)
      console.log("Registration status:", { allowed, count, sampleData })
    } catch (error) {
      console.error("Error checking registration status:", error)
    } finally {
      setCheckingRegistration(false)
    }
  }

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()
    checkRegistrationStatus()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id)

      // Handle user sign in (covers both new signups and existing user logins)
      if (event === "SIGNED_IN" && session?.user) {
        setCreatingProfile(true)
        try {
          // Check if profile already exists
          const existingProfile = await getUserProfile(session.user.id)
          if (!existingProfile) {
            // Create profile for new user
            console.log("Creating profile for new user:", session.user.id)
            await createUserProfile(session.user.id, session.user.email || "")
            console.log("Profile created successfully")
          } else {
            console.log("Profile already exists for user:", session.user.id)
          }
        } catch (error) {
          console.error("Error handling user profile:", error)
          setAuthError("There was an issue setting up your profile. Please try refreshing the page.")
        } finally {
          setCreatingProfile(false)
        }
      }

      setUser(session?.user ?? null)

      if (event === "SIGNED_IN") {
        checkRegistrationStatus()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setAuthError(null)

    try {
      if (isSignUp) {
        // Check registration status before attempting signup
        const allowed = await isRegistrationAllowed()
        if (!allowed) {
          setAuthError(
            "Registration is not allowed. This portfolio is in single-user mode and already has an admin user.",
          )
          setLoading(false)
          return
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) {
          setAuthError(error.message)
        } else if (data.user && !data.user.email_confirmed_at) {
          // User needs to confirm email
          setAuthError("Please check your email for the confirmation link!")
        } else if (data.user && data.user.email_confirmed_at) {
          // User was created and confirmed immediately (auto-confirm enabled)
          console.log("User created and confirmed immediately:", data.user.id)
          // Profile creation will be handled by the auth state change listener
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          setAuthError(error.message)
        }
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  // Handle the case where user is signed in but we're still creating their profile
  if (user && creatingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Setting up your profile...</p>
          {isSampleData && <p className="text-xs text-slate-500 mt-2">Replacing sample data with your information</p>}
        </div>
      </div>
    )
  }

  if (loading || checkingRegistration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Card className="w-full max-w-md border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Portfolio Admin
            </CardTitle>
            <CardDescription>
              {userCount === 0
                ? "Create your admin account to get started"
                : isSampleData
                  ? "Replace sample data with your own account"
                  : "Sign in to manage your portfolio content"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Show sample data status */}
            {isSampleData && (
              <Alert className="mb-4">
                <Database className="h-4 w-4" />
                <AlertDescription>
                  Sample data detected (John Doe). You can create your own account to replace it with your information.
                </AlertDescription>
              </Alert>
            )}

            {/* Show registration status */}
            {userCount > 0 && !isSampleData && (
              <Alert className="mb-4">
                <Users className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    This portfolio is in single-user mode. {userCount} admin user{userCount !== 1 ? "s" : ""}{" "}
                    registered.
                  </span>
                  <Button variant="ghost" size="sm" onClick={checkRegistrationStatus} className="ml-2 h-6 w-6 p-0">
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Show auth errors */}
            {authError && (
              <Alert className="mb-4" variant={authError.includes("check your email") ? "default" : "destructive"}>
                {authError.includes("check your email") ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            {/* Show warning if trying to sign up when not allowed */}
            {isSignUp && !registrationAllowed && (
              <Alert className="mb-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Registration is disabled. This portfolio already has a real admin user.
                </AlertDescription>
              </Alert>
            )}

            <Tabs
              value={isSignUp ? "signup" : "signin"}
              onValueChange={(v) => {
                setIsSignUp(v === "signup")
                setAuthError(null) // Clear errors when switching tabs
              }}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup" disabled={!registrationAllowed}>
                  {registrationAllowed ? (isSampleData ? "Replace Sample Data" : "Sign Up") : "Sign Up (Disabled)"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                {registrationAllowed ? (
                  <form onSubmit={handleAuth} className="space-y-4">
                    {isSampleData && (
                      <Alert className="mb-4">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Creating your account will automatically replace the sample data with your information.
                        </AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        disabled={loading}
                      />
                      <p className="text-xs text-slate-500">Password must be at least 6 characters long</p>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isSampleData ? "Replacing sample data..." : "Creating account..."}
                        </>
                      ) : isSampleData ? (
                        "Replace Sample Data"
                      ) : (
                        "Create Admin Account"
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Registration Disabled</h3>
                    <p className="text-sm text-gray-600">
                      This portfolio is configured for single-user mode and already has a real admin user.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <AdminDashboard user={user} onSignOut={handleSignOut} />
}
