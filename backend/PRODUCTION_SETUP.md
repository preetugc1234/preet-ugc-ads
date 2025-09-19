# Complete Production Setup Guide

## 🔧 Your Actual Configuration

### **URLs & Endpoints:**
- **Frontend (Lovable)**: `https://preet-ugc-ads.lovable.app`
- **Backend (Render)**: `https://preet-ugc-ads.onrender.com`
- **Supabase**: `https://uchvakaeswmuvqnzjiiu.supabase.co`
- **Database**: MongoDB Atlas (configured)

### **Authentication Keys:**
- **Supabase URL**: `https://uchvakaeswmuvqnzjiiu.supabase.co`
- **Supabase Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjaHZha2Flc3dtdXZxbnpqaWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMDEwNzQsImV4cCI6MjA3MzY3NzA3NH0.rufufy_1L07QkSDOheIyuH8nD4MeT2LuAeF57znPx6k`
- **Google OAuth Callback**: `https://uchvakaeswmuvqnzjiiu.supabase.co/auth/v1/callback`

---

## 🎯 Step 1: Configure Supabase Dashboard

### **Go to:** https://uchvakaeswmuvqnzjiiu.supabase.co

### **Authentication → Settings → URL Configuration:**

**Site URL:**
```
https://preet-ugc-ads.lovable.app
```

**Redirect URLs** (add all these):
```
http://localhost:3000/auth/callback
http://localhost:3000/dashboard
https://preet-ugc-ads.lovable.app/auth/callback
https://preet-ugc-ads.lovable.app/dashboard
https://preet-ugc-ads.lovable.app/auth/success
https://preet-ugc-ads.lovable.app/
```

### **Authentication → Providers → Google:**
1. **Toggle Google ON**
2. **Get Google OAuth credentials** (see Step 2)
3. **Add credentials to Supabase**

---

## 🎯 Step 2: Google Cloud Console Setup

### **Go to:** [Google Cloud Console](https://console.cloud.google.com)

1. **Create/Select Project**: "UGC AI SaaS"
2. **Enable APIs:**
   - Go to "APIs & Services" → "Library"
   - Search and enable "Google+ API"

3. **Create OAuth Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "UGC AI SaaS Auth"

4. **Authorized redirect URIs** (add this exact URL):
   ```
   https://uchvakaeswmuvqnzjiiu.supabase.co/auth/v1/callback
   ```

5. **Copy credentials** and add to Supabase Google provider:
   - Client ID
   - Client Secret

---

## 🎯 Step 3: Render Environment Variables

### **Go to your Render dashboard** → Select backend service → Environment tab

**Add these variables:**
```
SUPABASE_URL=https://uchvakaeswmuvqnzjiiu.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjaHZha2Flc3dtdXZxbnpqaWl1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODEwMTA3NCwiZXhwIjoyMDczNjc3MDc0fQ.uDdK083H69paciaAyDm7jGny9qBzwqepuY3tQRIWyHg
SUPABASE_JWT_SECRET=tc9ikJMAYokOFoMUEgxpfwmEHiG14ilqmN/Z9Y53sepTMT79rCKE1ED7GPl7poeh2Ym55mCe3aURQzuAU5IJ7w==
MONGODB_URI=mongodb+srv://Preet1234:Preet1246@ugc.qqqbt5d.mongodb.net/?retryWrites=true&w=majority&appName=UGC
FRONTEND_URL=https://preet-ugc-ads.lovable.app
ENVIRONMENT=production
PORT=8000
```

---

## 🎯 Step 4: Frontend Integration (Lovable)

### **Add to your Lovable project:**

```javascript
// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uchvakaeswmuvqnzjiiu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjaHZha2Flc3dtdXZxbnpqaWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMDEwNzQsImV4cCI6MjA3MzY3NzA3NH0.rufufy_1L07QkSDOheIyuH8nD4MeT2LuAeF57znPx6k'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// API base URL
export const API_BASE_URL = 'https://preet-ugc-ads.onrender.com'
```

### **Authentication Flow:**

```javascript
// Sign in with Google
const handleGoogleSignIn = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://preet-ugc-ads.lovable.app/auth/callback'
    }
  })

  if (error) console.error('Auth error:', error)
}

// Get user session
const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// API calls with authentication
const callBackendAPI = async (endpoint, options = {}) => {
  const session = await getSession()

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': session ? `Bearer ${session.access_token}` : '',
      ...options.headers
    }
  })

  return response.json()
}

// Example: Get user profile
const getUserProfile = () => callBackendAPI('/api/auth/me')

// Example: Get user credits
const getUserCredits = () => callBackendAPI('/api/auth/me/credits')
```

### **Auth Callback Page** (`/auth/callback`):

```javascript
// pages/auth/callback.jsx
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (data?.session) {
        // User authenticated successfully
        router.push('/dashboard')
      } else {
        // Authentication failed
        router.push('/login?error=auth_failed')
      }
    }

    handleAuthCallback()
  }, [router])

  return <div>Authenticating...</div>
}
```

---

## 🎯 Step 5: Test Complete Flow

### **1. Test Backend (Render):**
```bash
curl https://preet-ugc-ads.onrender.com/health
curl https://preet-ugc-ads.onrender.com/api/auth/status
```

### **2. Test Frontend Authentication:**
1. Go to `https://preet-ugc-ads.lovable.app`
2. Click "Sign in with Google"
3. Complete Google OAuth
4. Should redirect to `/auth/callback` then `/dashboard`

### **3. Test API Integration:**
```javascript
// Should work after user is authenticated
const profile = await getUserProfile()
const credits = await getUserCredits()
```

---

## 🎯 Complete Architecture

```
User → Frontend (Lovable) → Supabase Auth → Google OAuth
  ↓
JWT Token → Backend API (Render) → MongoDB Atlas
  ↓
Protected Endpoints → User Management → Credit System
```

---

## 🚀 You're Production Ready!

✅ **Authentication**: Supabase + Google OAuth
✅ **Frontend**: Lovable (`preet-ugc-ads.lovable.app`)
✅ **Backend**: Render (`preet-ugc-ads.onrender.com`)
✅ **Database**: MongoDB Atlas
✅ **Security**: JWT tokens, protected routes
✅ **User System**: Auto-creation, credits, admin roles

Just complete the Google OAuth setup in Google Cloud Console and Supabase, and your entire authentication system will be live! 🎉