/**
 * Supabase client configuration for authentication
 * and backend API communication
 */

import { createClient } from '@supabase/supabase-js'

// Supabase configuration - your actual credentials
const supabaseUrl = 'https://uchvakaeswmuvqnzjiiu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjaHZha2Flc3dtdXZxbnpqaWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMDEwNzQsImV4cCI6MjA3MzY3NzA3NH0.rufufy_1L07QkSDOheIyuH8nD4MeT2LuAeF57znPx6k'

// Debug configuration
console.log('🔧 Supabase Config:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey.length,
  origin: typeof window !== 'undefined' ? window.location.origin : 'server'
})

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: {
      getItem: (key: string) => {
        try {
          return localStorage.getItem(key)
        } catch (error) {
          console.warn('Failed to read from localStorage:', error)
          return null
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value)
        } catch (error) {
          console.warn('Failed to write to localStorage:', error)
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key)
        } catch (error) {
          console.warn('Failed to remove from localStorage:', error)
        }
      }
    }
  }
})

// Backend API configuration
export const API_BASE_URL = 'https://preet-ugc-ads.onrender.com'

// Clear potentially corrupted auth data - AGGRESSIVE APPROACH
export const clearAuthData = () => {
  try {
    // Clear localStorage completely
    const keysToRemove = [
      'sb-uchvakaeswmuvqnzjiiu-auth-token',
      'supabase.auth.token',
      'sb-auth-token'
    ]
    keysToRemove.forEach(key => localStorage.removeItem(key))

    // Clear all supabase related keys
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
        localStorage.removeItem(key)
      }
    })

    // Also clear sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
        sessionStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.warn('Failed to clear auth data:', error)
  }
}

// Nuclear option - clear ALL browser storage
export const clearAllBrowserStorage = async () => {
  try {
    // Clear localStorage
    localStorage.clear()

    // Clear sessionStorage
    sessionStorage.clear()

    // Clear IndexedDB
    if ('indexedDB' in window) {
      const databases = await indexedDB.databases()
      await Promise.all(
        databases.map(db => {
          if (db.name) {
            return new Promise((resolve, reject) => {
              const deleteReq = indexedDB.deleteDatabase(db.name!)
              deleteReq.onsuccess = () => resolve(true)
              deleteReq.onerror = () => reject(deleteReq.error)
            })
          }
        })
      )
    }

    // Clear all cookies for this domain
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    console.log('All browser storage cleared successfully')
    return true
  } catch (error) {
    console.warn('Failed to clear all browser storage:', error)
    return false
  }
}

// Authentication helpers
export const auth = {
  // Sign up with email and password
  signUpWithEmail: async (email: string, password: string, userData: { firstName: string, lastName: string }) => {
    try {
      // Clear browser storage first
      await clearAllBrowserStorage()
      await new Promise(resolve => setTimeout(resolve, 500))

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            full_name: `${userData.firstName} ${userData.lastName}`
          }
          // Note: Email confirmation is controlled by Supabase project settings
          // If email confirmation is enabled, users will need to verify their email
          // If disabled, users will be automatically signed in
        }
      })

      if (error) {
        console.error('Email signup error:', error)
      }

      return { data, error }
    } catch (error) {
      console.error('Signup error:', error)
      return { data: null, error }
    }
  },

  // Sign in with email and password
  signInWithEmail: async (email: string, password: string) => {
    try {
      // Clear browser storage first
      await clearAllBrowserStorage()
      await new Promise(resolve => setTimeout(resolve, 500))

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Email signin error:', error)
      }

      return { data, error }
    } catch (error) {
      console.error('Signin error:', error)
      return { data: null, error }
    }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      console.log('🚀 Starting Google OAuth sign in...')

      // Get the current origin and ensure proper redirect URL
      const currentOrigin = window.location.origin
      const redirectUrl = `${currentOrigin}/auth/callback`

      console.log('🔗 Google OAuth redirect URL:', redirectUrl)
      console.log('🌐 Current origin:', currentOrigin)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent' // Better mobile compatibility
          },
          // Better mobile support
          skipBrowserRedirect: false
        }
      })

      if (error) {
        console.error('❌ Google OAuth error:', {
          message: error.message,
          status: error.status,
          code: error.code
        })
      } else {
        console.log('✅ Google OAuth initiated successfully')
      }

      return { data, error }
    } catch (error) {
      console.error('❌ Google sign in error:', error)
      return { data: null, error }
    }
  },

  // Sign out
  signOut: async () => {
    try {
      console.log('🔄 Supabase: Starting sign out...')

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut({
        scope: 'global' // Sign out from all sessions
      })

      if (error) {
        console.error('❌ Supabase sign out error:', error)
      } else {
        console.log('✅ Supabase sign out successful')
      }

      // Clear only auth-related data, not all browser storage
      try {
        const authKeys = [
          'sb-uchvakaeswmuvqnzjiiu-auth-token',
          'supabase.auth.token',
          'sb-auth-token'
        ]
        authKeys.forEach(key => {
          localStorage.removeItem(key)
          sessionStorage.removeItem(key)
        })

        // Clear any keys that contain 'supabase' or 'auth'
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
            localStorage.removeItem(key)
          }
        })
      } catch (clearError) {
        console.warn('⚠️ Error clearing auth data:', clearError)
      }

      return { error }
    } catch (error) {
      console.error('❌ Sign out error:', error)
      return { error }
    }
  },

  // Get current session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Get current user
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export default supabase