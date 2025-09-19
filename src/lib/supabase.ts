/**
 * Supabase client configuration for authentication
 * and backend API communication
 */

import { createClient } from '@supabase/supabase-js'

// Supabase configuration - your actual credentials
const supabaseUrl = 'https://uchvakaeswmuvqnzjiiu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjaHZha2Flc3dtdXZxbnpqaWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMDEwNzQsImV4cCI6MjA3MzY3NzA3NH0.rufufy_1L07QkSDOheIyuH8nD4MeT2LuAeF57znPx6k'

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
  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      // AGGRESSIVE: Clear ALL browser storage first
      await clearAllBrowserStorage()

      // Wait a bit for storage clearing to complete
      await new Promise(resolve => setTimeout(resolve, 500))

      // Get the current origin and ensure proper redirect URL
      const currentOrigin = window.location.origin
      const redirectUrl = `${currentOrigin}/auth/callback`

      console.log('Starting Google OAuth with redirect:', redirectUrl)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })

      if (error) {
        console.error('OAuth error details:', {
          message: error.message,
          status: error.status,
          code: error.code
        })
      }
      return { data, error }
    } catch (error) {
      console.error('Google sign in error:', error)
      return { data: null, error }
    }
  },

  // Sign out
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      // Clear auth data after sign out
      clearAuthData()
      return { error }
    } catch (error) {
      // Even if sign out fails, clear local data
      clearAuthData()
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