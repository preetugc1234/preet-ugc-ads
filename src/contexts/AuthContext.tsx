/**
 * Authentication Context Provider
 * Manages user authentication state and provides auth-related functionality
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase, auth } from '../lib/supabase'
import { api, User } from '../lib/api'
import { useToast } from '../hooks/use-toast'

interface AuthContextType {
  // Auth state
  user: User | null
  session: any
  loading: boolean

  // Auth actions
  signInWithGoogle: () => Promise<void>
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
        // Get initial session
        const { session: initialSession } = await auth.getSession()

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
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session)

        if (mounted) {
          setSession(session)

          if (event === 'SIGNED_IN' && session) {
            await loadUserProfile()
            toast({
              title: "Welcome!",
              description: "You've been successfully signed in.",
            })
          } else if (event === 'SIGNED_OUT') {
            setUser(null)
            setLoading(false)
            toast({
              title: "Signed out",
              description: "You've been successfully signed out.",
            })
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
      const userProfile = await api.getCurrentUser()
      setUser(userProfile)
    } catch (error) {
      console.error('Error loading user profile:', error)
      // If user doesn't exist in backend, they'll be created on first API call
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const { error } = await auth.signInWithGoogle()

      if (error) {
        throw error
      }

      // The auth state change listener will handle the rest
    } catch (error) {
      console.error('Error signing in:', error)
      toast({
        title: "Sign in failed",
        description: "There was an error signing you in. Please try again.",
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
    signOut,
    refreshUser,
    isAuthenticated: !!session && !!user,
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