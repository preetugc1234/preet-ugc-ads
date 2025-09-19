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
        // Get initial session with retry logic
        let initialSession = null
        let retryCount = 0
        const maxRetries = 3

        while (retryCount < maxRetries && !initialSession) {
          try {
            const { session } = await auth.getSession()
            initialSession = session
            break
          } catch (sessionError) {
            console.warn(`Session fetch attempt ${retryCount + 1} failed:`, sessionError)
            retryCount++

            if (retryCount === maxRetries) {
              // Clear potentially corrupted data and try once more
              clearAuthData()
              await new Promise(resolve => setTimeout(resolve, 100))
              const { session } = await auth.getSession()
              initialSession = session
            }
          }
        }

        if (mounted) {
          setSession(initialSession)

          if (initialSession) {
            await loadUserProfile()
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
            console.log('✅ User signed in, loading profile...')
            await loadUserProfile()
            toast({
              title: "Welcome!",
              description: "You've been successfully signed in.",
            })
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
      // create a fallback user and let the backend handle user creation on next API call
      if (session?.user) {
        console.log('📝 Creating fallback user object from Supabase session')

        const fallbackUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                `${session.user.user_metadata?.first_name || ''} ${session.user.user_metadata?.last_name || ''}`.trim() ||
                session.user.email?.split('@')[0] ||
                'User',
          plan: 'free',
          credits: 1000, // Default credits for new users as per prompt.md
          is_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setUser(fallbackUser)

        console.log('⚠️ Using fallback user - backend will sync on next API call:', fallbackUser)

        // Show a toast to let user know the profile is being set up
        toast({
          title: "Setting up your profile",
          description: "Your account is being created in our system.",
        })
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
      setLoading(true)
      const { error } = await auth.signOut()

      if (error) {
        throw error
      }

      // The auth state change listener will handle the rest
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: "Sign out failed",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive"
      })
      setLoading(false)
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