# 🔧 Google OAuth Setup Guide

## 🎯 Goal
Make Google OAuth work exactly like email/password auth:
1. User clicks "Login with Google"
2. Google authentication popup/redirect
3. User authenticates with Google
4. **Immediate redirect to dashboard** (no email confirmation needed)

## 📋 **Required Configuration Steps**

### **Step 1: Supabase Configuration**

In your **Supabase Dashboard**:

1. **Go to Authentication → Providers**
2. **Enable Google Provider**
3. **Configure Google Provider:**
   ```
   Enable Google provider: ✅ ON
   Client ID: [Your Google Client ID]
   Client Secret: [Your Google Client Secret]
   ```

### **Step 2: Google Console Configuration**

In **Google Cloud Console**:

1. **Go to:** https://console.cloud.google.com/
2. **Select your project** (or create new one)
3. **Navigate to:** APIs & Services → Credentials
4. **Create OAuth 2.0 Client ID** (if not exists)
5. **Configure Authorized redirect URIs:**

   **Add these exact URLs:**
   ```
   https://[your-supabase-project-id].supabase.co/auth/v1/callback
   ```

   **Find your Supabase project ID:**
   - In Supabase dashboard → Settings → General
   - It's in your project URL: `https://[PROJECT-ID].supabase.co`

### **Step 3: Supabase URL Configuration**

In **Supabase Dashboard** → **Authentication** → **URL Configuration**:

```
Site URL: https://preet-ugc-ads.lovable.app
Redirect URLs:
- https://preet-ugc-ads.lovable.app/auth/callback
- http://localhost:8080/auth/callback
```

## 🔍 **Testing Steps**

### **Test Locally:**
1. **Open dev tools** (F12) → Console
2. **Go to:** `http://localhost:8080/simple-login`
3. **Click "Login with Google"**
4. **Check console for:**
   ```
   🚀 Starting Google OAuth sign in...
   🔗 Google OAuth redirect URL: http://localhost:8080/auth/callback
   ✅ Google OAuth initiated successfully
   ```

### **Test on Production:**
1. **Go to:** `https://preet-ugc-ads.lovable.app/simple-login`
2. **Click "Login with Google"**
3. **Should redirect to Google**
4. **After Google auth, should redirect to dashboard**

## 🚨 **Common Issues & Solutions**

### **Issue 1: "OAuth client not found"**
**Cause:** Google Client ID/Secret not configured in Supabase
**Fix:** Add correct Google credentials in Supabase

### **Issue 2: "Redirect URI mismatch"**
**Cause:** Wrong redirect URI in Google Console
**Fix:** Add exact Supabase callback URL:
```
https://[your-supabase-project-id].supabase.co/auth/v1/callback
```

### **Issue 3: Google popup blocked**
**Cause:** Browser blocking popups
**Fix:** Allow popups for your domain or use redirect flow

### **Issue 4: OAuth works but no dashboard redirect**
**Cause:** Email confirmation might still be enabled
**Fix:** Ensure "Enable email confirmations" is OFF in Supabase

## 🔄 **Expected Flow**

### **Successful Google OAuth:**
```
1. User clicks "Login with Google"
2. Google OAuth popup opens
3. User selects Google account
4. Google redirects to: [supabase-project].supabase.co/auth/v1/callback
5. Supabase creates session (no email confirmation)
6. Supabase redirects to: your-app.com/auth/callback
7. AuthCallback component detects session
8. Automatic redirect to /dashboard
9. Dashboard loads with user data
```

## 📊 **Debug Console Output**

**When clicking Google login:**
```
🚀 Starting Google OAuth sign in...
🔗 Google OAuth redirect URL: https://preet-ugc-ads.lovable.app/auth/callback
✅ Google OAuth initiated successfully
```

**After Google auth (in /auth/callback page):**
```
🔔 Auth state changed: SIGNED_IN
🔍 AuthContext State: { hasSession: true, isAuthenticated: true }
```

**In AuthCallback component:**
```
Success!
Redirecting to your dashboard...
```

## 🎯 **Quick Checklist**

- [ ] Google Provider enabled in Supabase
- [ ] Google Client ID/Secret configured
- [ ] Correct redirect URI in Google Console
- [ ] Email confirmation disabled in Supabase
- [ ] Site URL configured in Supabase
- [ ] Redirect URLs configured in Supabase

## 🆘 **If Still Not Working**

1. **Check browser console** for error messages
2. **Check network tab** for failed requests
3. **Verify Google Console project** is correct
4. **Double-check all URLs** are exactly correct
5. **Try incognito mode** to rule out cache issues

Most issues are configuration-related in either Supabase or Google Console.