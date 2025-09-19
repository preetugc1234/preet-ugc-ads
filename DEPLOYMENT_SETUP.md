# Deployment Setup Guide

## 🚀 Production URLs
- **Frontend (Lovable)**: https://preet-ugc-ads.lovable.app
- **Backend (Render)**: https://preet-ugc-ads.onrender.com

## ✅ Completed Setup

### Backend Connection
- ✅ API_BASE_URL correctly points to Render backend
- ✅ CORS properly configured for Lovable domain
- ✅ Authentication endpoints working
- ✅ Backend health check: API and Auth services healthy

### Frontend Integration
- ✅ Login/Signup flow implemented
- ✅ Auto-redirect to dashboard after auth
- ✅ Backend API integration for user profiles
- ✅ Credit system and job management ready
- ✅ Razorpay billing integration prepared

## 🔧 Required Supabase Configuration

In your Supabase project dashboard, configure these URLs:

### Authentication Settings
1. **Site URL**: `https://preet-ugc-ads.lovable.app`
2. **Redirect URLs** (add these):
   ```
   https://preet-ugc-ads.lovable.app/auth/callback
   http://localhost:8080/auth/callback
   ```

### Google OAuth Provider Settings
Make sure Google OAuth is enabled with:
- **Authorized redirect URIs** in Google Console:
  ```
  https://[your-supabase-project].supabase.co/auth/v1/callback
  ```

## 🎯 Authentication Flow

1. **User visits**: `https://preet-ugc-ads.lovable.app/simple-login`
2. **Authenticates**: Via email/password or Google OAuth
3. **Supabase**: Handles authentication
4. **Backend**: Creates/loads user profile in MongoDB
5. **Redirect**: Automatically to `/dashboard`
6. **Dashboard**: Loads with user data and 1000 default credits

## 📊 Database Status
- ⚠️ MongoDB connection currently unhealthy (needs fixing in backend)
- ✅ Fallback user profiles work for testing
- 🔄 Backend will auto-create users once DB is restored

## 🔗 API Endpoints Ready
- `/api/auth/me` - Get current user
- `/api/jobs/create` - Create new generation job
- `/api/jobs/{id}/status` - Check job status
- `/api/razorpay/create-order` - Create payment order
- `/api/user/history` - Get user's generation history
- `/api/user/credits/balance` - Get credit balance

## 🚀 Next Steps
1. Configure Supabase redirect URLs (above)
2. Deploy latest frontend changes to Lovable
3. Fix MongoDB connection in backend (if needed)
4. Test complete authentication flow
5. Set up Razorpay webhook endpoints for production

## 🔍 Testing
Test the complete flow at: https://preet-ugc-ads.lovable.app
- Should redirect to `/simple-login` if not authenticated
- Login should redirect to `/dashboard`
- Dashboard should load with user data