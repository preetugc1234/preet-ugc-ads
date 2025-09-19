# 🐛 Google OAuth Debug Guide

## 🔍 **Your Current Setup:**
- ✅ Supabase URI: `https://uchvakaeswmuvqnzjiiu.supabase.co/auth/v1/callback`
- ✅ Google provider enabled in Supabase
- ✅ No console errors
- ❌ **Issue: Google OAuth not redirecting to dashboard**

## 🚨 **Most Likely Causes:**

### **1. Google OAuth Popup Blocked**
**Symptoms:** Click Google button → Nothing happens
**Check:** Look for popup blocker icon in browser address bar
**Fix:** Allow popups for your domain

### **2. OAuth Session Not Created**
**Symptoms:** Google auth completes → Stays on callback page
**Cause:** Google auth succeeded but no Supabase session created
**Debug:** Check `/auth/callback` page logs

### **3. Wrong Redirect Configuration**
**Symptoms:** OAuth redirects to wrong page or shows error
**Check:** Google Console redirect URIs

### **4. Email Domain Restrictions**
**Symptoms:** Google auth fails for certain email domains
**Check:** Google Console → OAuth consent screen → User type

## 🔬 **Enhanced Debugging Steps:**

### **Step 1: Test with Enhanced Logging**
1. **Open browser dev tools** (F12) → Console
2. **Go to your login page**
3. **Click "Login with Google"**
4. **Check console output:**

**Expected logs:**
```
🔘 Google login button clicked
🚀 Starting Google OAuth sign in...
🔗 Google OAuth redirect URL: https://preet-ugc-ads.lovable.app/auth/callback
✅ Google OAuth initiated successfully
🔄 Google OAuth initiated from login page
```

### **Step 2: Check Popup Behavior**
- **Does Google popup open?**
  - YES → Check Step 3
  - NO → Popup blocked, allow popups
- **Does popup show Google login?**
  - YES → Continue with Google auth
  - NO → Configuration issue

### **Step 3: Monitor Auth Callback**
After Google auth, you should land on `/auth/callback` page.

**Check console for:**
```
🔍 AuthCallback: Starting callback handling
🔗 Current URL: https://your-app.com/auth/callback#access_token=...
🔍 Auth params found: { hasAuthParams: true, accessToken: true }
🔔 Auth state changed: SIGNED_IN
✅ User signed in via: google
```

### **Step 4: Check Session Creation**
**In AuthContext logs:**
```
🔍 AuthContext State: {
  hasUser: true,
  hasSession: true,
  isAuthenticated: true
}
```

## 🔧 **Common Fixes:**

### **Fix 1: Allow Popups**
- Click popup blocker icon in address bar
- Allow popups for your domain
- Try Google OAuth again

### **Fix 2: Check Google Console Settings**
In Google Cloud Console → Credentials:

1. **Authorized JavaScript origins:**
   ```
   https://preet-ugc-ads.lovable.app
   http://localhost:8080
   ```

2. **Authorized redirect URIs:**
   ```
   https://uchvakaeswmuvqnzjiiu.supabase.co/auth/v1/callback
   ```

### **Fix 3: Verify OAuth Consent Screen**
- **User Type:** External (if testing with any Google account)
- **Test users:** Add specific emails if using "Testing" status
- **Scopes:** Include email and profile

### **Fix 4: Check Supabase Site URL**
In Supabase → Authentication → URL Configuration:
```
Site URL: https://preet-ugc-ads.lovable.app
```

## 🎯 **Specific Tests to Try:**

### **Test 1: Popup Test**
```javascript
// Run this in browser console to test popup
const popup = window.open('https://google.com', 'test', 'width=500,height=600');
// If popup opens → Popups allowed
// If nothing happens → Popup blocked
popup.close();
```

### **Test 2: Manual Callback Test**
Visit this URL directly (replace with your actual domain):
```
https://preet-ugc-ads.lovable.app/auth/callback
```
Should redirect to login page (if not authenticated).

### **Test 3: Incognito Mode**
- Open incognito/private window
- Try Google OAuth
- Rules out cache/extension issues

## 📊 **Debug Checklist:**

- [ ] Google popup opens when clicking button
- [ ] Google auth completes successfully
- [ ] Redirects to `/auth/callback` page
- [ ] Console shows auth session created
- [ ] Console shows `isAuthenticated: true`
- [ ] Redirects to `/dashboard`

## 🆘 **If Still Not Working:**

1. **Share console output** from the enhanced debugging
2. **Check Google Console** error logs
3. **Verify all URLs** are exactly correct
4. **Try different browser** to rule out browser-specific issues

Most Google OAuth issues are configuration-related. The enhanced logging will show exactly where the flow breaks.