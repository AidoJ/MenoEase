# Fixing 422 Unprocessable Content Error

## The Error
```
POST /auth/v1/token?grant_type=password 422 (Unprocessable Content)
```

A 422 error means the request format is correct, but Supabase is rejecting the data. Common causes:

## Solution 1: Check Supabase Auth Settings

### Disable Email Confirmation (For Testing)
1. Go to **Supabase Dashboard**
2. **Authentication** → **Settings**
3. Scroll to **Email Auth**
4. **Disable** "Enable email confirmations"
5. Click **Save**

### Verify Email Provider Settings
1. Go to **Authentication** → **Providers** → **Email**
2. Make sure it's **Enabled**
3. Check **Confirm email** is **OFF** (for testing)
4. Save changes

## Solution 2: Check Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. **Site URL** should be: `https://your-site.netlify.app`
3. **Redirect URLs** should include:
   - `https://your-site.netlify.app/**`
   - `https://your-site.netlify.app/*`
   - `http://localhost:3000/**` (for local dev)

## Solution 3: Test with Supabase Dashboard

Create a test user manually to verify auth is working:

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter:
   - Email: `test@example.com`
   - Password: `test123456`
   - Auto Confirm User: **ON** (important!)
4. Click **Create user**
5. Try logging in with these credentials

If this works, the issue is with the signup flow. If it doesn't, there's a deeper config issue.

## Solution 4: Check Browser Console

Open browser console (F12) and look for the detailed error. The 422 error should have a response body with more details like:

```json
{
  "error": "invalid_grant",
  "error_description": "Invalid login credentials"
}
```

Or:

```json
{
  "error": "email_not_confirmed",
  "error_description": "Email not confirmed"
}
```

## Solution 5: Verify Environment Variables

Make sure your Netlify environment variables are correct:
- `VITE_SUPABASE_URL` - Should be your full Supabase URL
- `VITE_SUPABASE_ANON_KEY` - Should be your anon/public key

## Common 422 Causes

1. **Email confirmation required** - Disable it for testing
2. **Invalid credentials** - Wrong email/password format
3. **User doesn't exist** - Need to sign up first
4. **Email not confirmed** - Disable confirmation or confirm email
5. **Rate limiting** - Too many attempts

## Quick Fix Checklist

- [ ] Email confirmations **disabled** in Supabase
- [ ] Email provider **enabled**
- [ ] Site URL configured correctly
- [ ] Redirect URLs added
- [ ] Tried creating user manually in Supabase dashboard
- [ ] Checked browser console for detailed error message
- [ ] Cleared browser cache/cookies

## After Fixing

1. **Clear browser cache/cookies**
2. **Try signing up** with a new email
3. **Check Supabase** → Authentication → Users to see if user was created
4. **Try logging in** with the credentials you just created

## Note About Users

- **Don't manually create users in the database** - Users are created automatically in `auth.users` when they sign up
- The `user_settings` table is separate - it's for user preferences, not authentication
- Users appear in Supabase → Authentication → Users automatically after signup




