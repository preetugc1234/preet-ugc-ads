# Supabase Authentication Setup Guide

## Overview
This guide will help you connect your FastAPI backend with Supabase Auth for complete authentication functionality. The authentication system is already built and ready - you just need to configure the Supabase connection.

## Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up/Login** with your GitHub account
3. **Create New Project**
   - Organization: Create or select your organization
   - Project name: `ugc-ai-saas`
   - Database password: Generate a strong password (save it securely)
   - Region: Choose closest to your users
   - Pricing plan: Free tier is perfect for development

## Step 2: Get Supabase Credentials

After project creation, go to **Settings → API**:

### Required Environment Variables:
```bash
# Copy these values from your Supabase dashboard
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret-here
```

### Where to find each value:

1. **SUPABASE_URL**:
   - Settings → API → Project URL

2. **SUPABASE_SERVICE_KEY**:
   - Settings → API → Service Role (secret key)
   - ⚠️ **Never expose this in frontend code**

3. **SUPABASE_JWT_SECRET**:
   - Settings → API → JWT Settings → JWT Secret

## Step 3: Configure Authentication Providers

### Enable Google OAuth:
1. Go to **Authentication → Settings → Auth Providers**
2. **Enable Google** provider
3. **Get Google OAuth credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`

4. **Add Google credentials to Supabase**:
   - Client ID: From Google Console
   - Client Secret: From Google Console

### Configure Authentication Settings:
1. **Site URL**: `http://localhost:3000` (for development)
2. **Redirect URLs**: Add your frontend URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-frontend-domain.com/auth/callback`

## Step 4: Set Environment Variables

### For Development (Local):
Create `.env` file in your backend directory:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
SUPABASE_JWT_SECRET=your-jwt-secret-here

# MongoDB (already configured)
MONGODB_URI=mongodb+srv://Preet1234:Preet1246@ugc.qqqbt5d.mongodb.net/?retryWrites=true&w=majority&appName=UGC

# Other settings
ENVIRONMENT=development
FRONTEND_URL=http://localhost:3000
PORT=8000
```

### For Production (Render):
Add these environment variables in your Render dashboard:

1. Go to your Render service
2. Go to **Environment** tab
3. Add each variable:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `SUPABASE_JWT_SECRET`

## Step 5: Test Authentication

### 1. Start your backend:
```bash
cd backend
python main.py
```

### 2. Test endpoints:
```bash
# Check auth status
curl http://localhost:8000/api/auth/status

# Should return:
{
  "status": "ok",
  "supabase_configured": true,
  "message": "Authentication system ready"
}
```

### 3. Frontend Integration:
```javascript
// Install Supabase client in your frontend
npm install @supabase/supabase-js

// Initialize Supabase client
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project-id.supabase.co'
const supabaseAnonKey = 'your-anon-public-key-here'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Login with Google
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'http://localhost:3000/auth/callback'
  }
})

// Get session token for backend API calls
const { data: session } = await supabase.auth.getSession()
const token = session?.session?.access_token

// Use token in API calls
fetch('http://localhost:8000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

## Step 6: Test Full Flow

### Complete Authentication Test:

1. **User signs in** with Google via your frontend
2. **Supabase returns JWT token**
3. **Frontend sends token** to your backend
4. **Backend verifies token** and creates/finds user in MongoDB
5. **Protected routes work** with the authenticated user

### Test Protected Endpoints:

```bash
# Get user profile (requires auth)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8000/api/auth/me

# Get user credits (requires auth)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8000/api/auth/me/credits

# Admin endpoints (requires admin role)
curl -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
     http://localhost:8000/api/auth/users
```

## Step 7: Create First Admin User

### Method 1 - Database Direct:
```javascript
// Connect to MongoDB and update a user
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { isAdmin: true } }
)
```

### Method 2 - After User Creation:
1. Sign in with Google once to create your user
2. Use MongoDB Atlas dashboard to set `isAdmin: true`
3. Or use the admin promotion endpoint with existing admin

## Common Issues & Solutions

### Issue 1: "Supabase credentials not configured"
- **Solution**: Double-check your environment variables are set correctly
- Restart your backend after adding .env file

### Issue 2: JWT verification fails
- **Solution**: Ensure `SUPABASE_JWT_SECRET` matches exactly from Supabase dashboard
- Check token is being sent with "Bearer " prefix

### Issue 3: User not created in MongoDB
- **Solution**: Check MongoDB connection is working
- Verify user creation function in logs

### Issue 4: CORS errors
- **Solution**: Add your frontend URL to `FRONTEND_URL` environment variable
- Check Supabase redirect URLs are configured

### Issue 5: Google OAuth not working
- **Solution**: Verify Google Cloud Console setup
- Check redirect URIs match exactly
- Ensure Google+ API is enabled

## Security Best Practices

1. **Never expose** `SUPABASE_SERVICE_KEY` in frontend code
2. **Use HTTPS** in production for all auth flows
3. **Set secure redirect URLs** in Supabase (no wildcards)
4. **Implement rate limiting** on auth endpoints
5. **Log authentication events** for monitoring
6. **Regular key rotation** for production
7. **Use environment-specific** Supabase projects

## Next Steps

Once authentication is working:

1. **Set up admin user** for testing admin features
2. **Test credit system** with real user flows
3. **Implement frontend auth state** management
4. **Set up monitoring** for auth failures
5. **Configure production** Supabase project
6. **Add user onboarding** flow

## Support

If you encounter issues:

1. Check Supabase logs: Dashboard → Logs
2. Check backend logs for detailed error messages
3. Verify all environment variables are set
4. Test with Supabase's built-in auth UI first
5. Check network/firewall issues

Your authentication system is production-ready and follows security best practices!