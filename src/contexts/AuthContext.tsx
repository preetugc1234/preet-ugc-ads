/**
 * Authentication Context Provider
 * Manages user authentication state and provides auth-related functionality
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase, auth, clearAuthData } from '../lib/supabase'
import { api, User } from '../lib/api'
import { useToast } from '../hooks/use-toast'

interface AuthContextType {
  // Auth state
  user: User | null
  session: any
  loading: boolean

  // Auth actions
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, userData: { firstName: string, lastName: string }) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>

  // User utilities
  isAuthenticated: boolean
  isAdmin: boolean

}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    async function initializeAuth() {
      try {
        // Get initial session with improved retry logic
        let initialSession = null
        let retryCount = 0
        const maxRetries = 3

        while (retryCount < maxRetries && !initialSession) {
          try {
            const { data, error } = await supabase.auth.getSession()
            if (error) {
              throw error
            }
            initialSession = data.session
            break
          } catch (sessionError) {
            console.warn(`Session fetch attempt ${retryCount + 1} failed:`, sessionError)
            retryCount++

            if (retryCount === maxRetries) {
              // Clear potentially corrupted data and try once more
              clearAuthData()
              await new Promise(resolve => setTimeout(resolve, 500))
              const { data } = await supabase.auth.getSession()
              initialSession = data.session
            } else {
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          }
        }

        if (mounted) {
          setSession(initialSession)

          if (initialSession) {
            // Verify the session is valid by checking if we can get user
            try {
              const { data: { user }, error } = await supabase.auth.getUser()
              if (error || !user) {
                console.log('⚠️ Invalid session detected, clearing...')
                // Clear invalid session
                await supabase.auth.signOut({ scope: 'global' })
                setSession(null)
                setUser(null)
                setLoading(false)
                return
              }
              await loadUserProfile()
            } catch (error) {
              console.error('❌ Error validating session:', error)
              // Clear potentially corrupted session
              await supabase.auth.signOut({ scope: 'global' })
              setSession(null)
              setUser(null)
              setLoading(false)
            }
          } else {
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        // If all else fails, clear auth data and reset state
        clearAuthData()
        if (mounted) {
          setSession(null)
          setUser(null)
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state changed:', event, {
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email
        })

        if (mounted) {
          setSession(session)

          if (event === 'SIGNED_IN' && session) {
            console.log('✅ User signed in via:', session.user?.app_metadata?.provider || 'unknown')
            console.log('📧 User email:', session.user?.email)
            console.log('🔑 Session expires at:', session.expires_at)

            // Only load profile if we don't already have user data
            if (!user) {
              loadUserProfile().catch(console.error)

              toast({
                title: "Welcome!",
                description: "You've been successfully signed in.",
              })
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('🚪 User signed out')
            setUser(null)
            setLoading(false)
            toast({
              title: "Signed out",
              description: "You've been successfully signed out.",
            })
          } else if (event === 'TOKEN_REFRESHED' && session) {
            console.log('🔄 Token refreshed')
            // Don't load profile again, just update session
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [toast])

  // Add tab focus persistence (minimal checks only)
  useEffect(() => {
    const handleFocus = async () => {
      // Only check session validity if we don't have a user or session appears invalid
      if (!user || !session) {
        try {
          const { data: { session: currentSession }, error } = await supabase.auth.getSession()
          if (currentSession && !user) {
            console.log('🔄 Restoring session after tab switch...')
            setSession(currentSession)
            await loadUserProfile()
          }
        } catch (error) {
          console.error('❌ Error checking session on focus:', error)
        }
      }
    }

    // Only check on visibility change (not focus) to be less aggressive
    window.addEventListener('visibilitychange', () => {
      if (!document.hidden && (!user || !session)) {
        handleFocus()
      }
    })

    return () => {
      window.removeEventListener('visibilitychange', handleFocus)
    }
  }, [user, session])

  // Load user profile from backend
  const loadUserProfile = async () => {
    try {
      setLoading(true)
      console.log('🔄 Loading user profile from backend...')

      const userProfile = await api.getCurrentUser()
      setUser(userProfile)
      console.log('✅ User profile loaded from backend:', userProfile)

    } catch (error) {
      console.error('❌ Error loading user profile from backend:', error)

      // If user doesn't exist in backend but we have a Supabase session,
      // retry a few times to allow backend to create the user
      if (session?.user) {
        console.log('📝 User not found in backend, retrying in case backend is creating user...')

        // Wait a moment for backend to process the authentication
        await new Promise(resolve => setTimeout(resolve, 2000))

        try {
          console.log('🔄 Retrying backend user load...')
          const userProfile = await api.getCurrentUser()
          setUser(userProfile)
          console.log('✅ User profile loaded from backend on retry:', userProfile)
          return
        } catch (retryError) {
          console.error('❌ Retry failed, backend user creation might have failed:', retryError)

          // Final attempt after another delay
          await new Promise(resolve => setTimeout(resolve, 3000))

          try {
            console.log('🔄 Final retry for backend user load...')
            const userProfile = await api.getCurrentUser()
            setUser(userProfile)
            console.log('✅ User profile loaded from backend on final retry:', userProfile)
            return
          } catch (finalError) {
            console.error('❌ All retries failed, this indicates a backend issue:', finalError)
            setUser(null)

            toast({
              title: "Connection Issue",
              description: "Unable to load your profile. Please refresh the page.",
              variant: "destructive"
            })
          }
        }
      } else {
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }

  // Sign up with email and password
  const signUpWithEmail = async (email: string, password: string, userData: { firstName: string, lastName: string }) => {
    console.log('🔄 AuthContext: Starting email signup', { email })

    try {
      setLoading(true)

      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('⏰ Signup timeout - forcing loading to false')
        setLoading(false)
        toast({
          title: "Signup timed out",
          description: "The signup process took too long. Please try again.",
          variant: "destructive"
        })
      }, 15000) // 15 second timeout

      const { data, error } = await auth.signUpWithEmail(email, password, userData)
      clearTimeout(timeoutId) // Clear timeout if request completes

      if (error) {
        console.error('❌ Email signup error:', error)
        toast({
          title: "Sign up failed",
          description: error.message || "There was an error creating your account. Please try again.",
          variant: "destructive"
        })
        setLoading(false)
        return
      }

      console.log('✅ Email signup successful', data)

      // Check if user needs email confirmation
      if (data.user && !data.session) {
        // Email confirmation required
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account, then sign in.",
        })
        setLoading(false)
      } else if (data.user && data.session) {
        // User is automatically signed in (no email confirmation required)
        console.log('🎉 User automatically signed in after signup')
        toast({
          title: "Welcome!",
          description: "Your account has been created successfully.",
        })
        // The auth state change listener will handle the rest (redirect to dashboard)
      } else {
        // Unexpected case
        toast({
          title: "Account created!",
          description: "Please try signing in with your new account.",
        })
        setLoading(false)
      }
    } catch (error) {
      console.error('❌ Error signing up:', error)
      toast({
        title: "Sign up failed",
        description: "Please clear your browser cache and try again.",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string) => {
    console.log('🔄 AuthContext: Starting email signin', { email })

    try {
      setLoading(true)

      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('⏰ Signin timeout - forcing loading to false')
        setLoading(false)
        toast({
          title: "Sign in timed out",
          description: "The sign in process took too long. Please try again.",
          variant: "destructive"
        })
      }, 15000) // 15 second timeout

      const { error } = await auth.signInWithEmail(email, password)
      clearTimeout(timeoutId) // Clear timeout if request completes

      if (error) {
        console.error('❌ Email signin error:', error)

        let errorMessage = "Invalid email or password. Please try again."
        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = "Invalid email or password. Please check your credentials."
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = "Please check your email and click the verification link first."
        }

        toast({
          title: "Sign in failed",
          description: errorMessage,
          variant: "destructive"
        })
        setLoading(false)
        return
      }

      console.log('✅ Email signin successful')

      // The auth state change listener will handle the rest
    } catch (error) {
      console.error('❌ Error signing in:', error)
      toast({
        title: "Sign in failed",
        description: "Please clear your browser cache and try again.",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    console.log('🔄 AuthContext: Starting Google OAuth')

    try {
      setLoading(true)

      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('⏰ Google OAuth timeout - forcing loading to false')
        setLoading(false)
        toast({
          title: "Google sign in timed out",
          description: "The Google sign in took too long. Please try again.",
          variant: "destructive"
        })
      }, 20000) // 20 second timeout for OAuth

      // Clear any existing corrupted auth data before attempting sign in
      clearAuthData()

      const { error } = await auth.signInWithGoogle()
      clearTimeout(timeoutId) // Clear timeout if request completes

      if (error) {
        console.error('❌ Google OAuth error:', error)

        // Handle specific error cases
        if (error.message?.includes('popup_closed_by_user')) {
          toast({
            title: "Sign in cancelled",
            description: "The sign in popup was closed. Please try again.",
            variant: "destructive"
          })
        } else if (error.message?.includes('access_denied')) {
          toast({
            title: "Access denied",
            description: "Google sign in was denied. Please try again and grant the necessary permissions.",
            variant: "destructive"
          })
        } else {
          toast({
            title: "Sign in failed",
            description: "There was an error signing you in. Please clear your browser cache and try again.",
            variant: "destructive"
          })
        }

        setLoading(false)
        return
      }

      console.log('✅ Google OAuth successful')

      // The auth state change listener will handle the rest
    } catch (error) {
      console.error('❌ Error signing in:', error)
      toast({
        title: "Sign in failed",
        description: "Please clear your browser cache and cookies, then try again.",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      console.log('🚪 Starting sign out process...')
      setLoading(true)

      // Clear local state immediately
      setUser(null)
      setSession(null)

      // Sign out from Supabase with global scope
      const { error } = await supabase.auth.signOut({ scope: 'global' })

      if (error) {
        console.error('❌ Supabase sign out error:', error)
      } else {
        console.log('✅ Supabase sign out successful')
      }

      // Clear all auth-related browser storage
      try {
        // Clear specific Supabase keys
        const authKeys = [
          'sb-uchvakaeswmuvqnzjiiu-auth-token',
          'supabase.auth.token',
          'sb-auth-token'
        ]
        authKeys.forEach(key => {
          localStorage.removeItem(key)
          sessionStorage.removeItem(key)
        })

        // Clear any keys containing 'supabase', 'sb-', or 'auth'
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
            localStorage.removeItem(key)
          }
        })

        Object.keys(sessionStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
            sessionStorage.removeItem(key)
          }
        })

        console.log('✅ Auth storage cleared')
      } catch (clearError) {
        console.warn('⚠️ Error clearing storage:', clearError)
      }

      console.log('✅ Sign out completed - redirecting to home')

      // Force redirect to landing page with cache bust
      window.location.href = '/?t=' + Date.now()

    } catch (error) {
      console.error('❌ Error signing out:', error)

      // Force clear everything even if sign out fails
      setUser(null)
      setSession(null)
      setLoading(false)

      // Clear storage anyway
      try {
        localStorage.clear()
        sessionStorage.clear()
      } catch (e) {
        console.warn('⚠️ Failed to clear storage:', e)
      }

      // Still redirect to home
      window.location.href = '/?t=' + Date.now()
    }
  }

  // Refresh user data
  const refreshUser = async () => {
    if (session) {
      await loadUserProfile()
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    refreshUser,
    isAuthenticated: !!session, // User is authenticated if they have a Supabase session
    isAdmin: user?.is_admin || false
  }

  // Debug logging for auth state
  useEffect(() => {
    console.log('🔍 AuthContext State:', {
      hasUser: !!user,
      hasSession: !!session,
      isAuthenticated: !!session,
      loading,
      userId: user?.id || session?.user?.id,
      email: user?.email || session?.user?.email
    })
  }, [user, session, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext