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
    detectSessionInUrl: true
  }
})

// Backend API configuration
export const API_BASE_URL = 'https://preet-ugc-ads.onrender.com'

// Authentication helpers
export const auth = {
  // Sign in with Google
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
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