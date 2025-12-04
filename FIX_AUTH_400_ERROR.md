# Fixing 400 Authentication Error

## The Error
```
Failed to load resource: the server responded with a status of 400
/auth/v1/token?grant_type=password
```

This 400 error means Supabase is rejecting the authentication request. Common causes:

## Solution 1: Disable Email Confirmation (For Testing)

By default, Supabase requires email confirmation. For development/testing, disable it:

1. Go to **Supabase Dashboard**
2. Click **Authentication** → **Settings**
3. Scroll to **Email Auth**
4. **Disable** "Enable email confirmations"
5. Click **Save**

Now try signing up again.

## Solution 2: Check Redirect URLs

Supabase needs to know which URLs are allowed:

1. Go to **Supabase Dashboard**
2. Click **Authentication** → **URL Configuration**
3. Under **Site URL**, add:
   - `http://localhost:3000` (for local dev)
   - `https://your-site.netlify.app` (your Netlify URL)
4. Under **Redirect URLs**, add:
   - `http://localhost:3000/**`
   - `https://your-site.netlify.app/**`
   - `https://your-site.netlify.app/*`
5. Click **Save**

## Solution 3: Verify Email Provider is Enabled

1. Go to **Supabase Dashboard**
2. Click **Authentication** → **Providers**
3. Make sure **Email** is enabled (toggle should be ON)
4. If disabled, enable it and save

## Solution 4: Check Browser Console for Detailed Error

Open browser console (F12) and look for the actual error message. It might say:
- "Invalid login credentials" - Wrong email/password
- "Email not confirmed" - Need to confirm email or disable confirmation
- "Invalid redirect URL" - Redirect URL not configured

## Solution 5: Test with Supabase Dashboard

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter email and password
4. Try logging in with those credentials

If this works, the issue is with the signup flow. If it doesn't, there's a deeper configuration issue.

## Quick Fix Checklist

- [ ] Email confirmations disabled (for testing)
- [ ] Site URL set in Supabase
- [ ] Redirect URLs configured
- [ ] Email provider enabled
- [ ] Tried creating user manually in Supabase dashboard

## After Fixing

1. Clear browser cache/cookies
2. Try signing up again
3. Check Supabase → Authentication → Users to see if user was created
4. Try logging in




