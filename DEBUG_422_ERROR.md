# Debugging 422 Error - Step by Step

## The Error
```
POST /auth/v1/token?grant_type=password 422 (Unprocessable Content)
```

A 422 means Supabase received the request but rejected the data. Let's find out why.

## Step 1: Check the Network Tab for Detailed Error

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try to sign in again
4. Find the request to `/auth/v1/token`
5. Click on it
6. Go to **Response** tab
7. Look for the error message - it will tell you exactly what's wrong

Common error messages you might see:
- `"Invalid login credentials"` - Wrong email/password
- `"Email not confirmed"` - Need to confirm email or disable confirmation
- `"User not found"` - User doesn't exist
- `"Invalid request"` - Something wrong with the request format

## Step 2: Verify User Was Created Correctly

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Find the user you created
3. Check:
   - **Email confirmed**: Should be checked (green)
   - **User ID**: Should exist
   - **Created at**: Should show recent date

If "Email confirmed" is NOT checked:
- Click on the user
- Click **Send magic link** or manually confirm
- Or disable email confirmation in settings

## Step 3: Double-Check Supabase Settings

### Authentication → Settings:
- [ ] **Enable email confirmations**: Should be **OFF** (for testing)
- [ ] **Site URL**: Should be your Netlify URL
- [ ] **Redirect URLs**: Should include your Netlify URL with `/**`

### Authentication → Providers → Email:
- [ ] **Enable Email provider**: Should be **ON**
- [ ] **Confirm email**: Should be **OFF** (for testing)

## Step 4: Test with Exact Credentials

When you created the user manually in Supabase:
1. What email did you use? (copy it exactly)
2. What password did you use? (copy it exactly)
3. Was "Auto Confirm User" checked? (should be YES)

Try logging in with those EXACT credentials (case-sensitive for email).

## Step 5: Check Browser Console

After I updated the code, you should now see more detailed logs:
- "Attempting sign in with email: ..."
- "Sign in error details: ..." (if there's an error)

What do you see in the console?

## Step 6: Verify Environment Variables

Make sure your Netlify environment variables are correct:
- `VITE_SUPABASE_URL` - Should be `https://ttqvefkilgitjzcewfgq.supabase.co`
- `VITE_SUPABASE_ANON_KEY` - Should be your actual anon key

## Common Issues and Fixes

### Issue: "Invalid login credentials"
**Fix**: 
- Verify email/password are correct
- Check for typos
- Make sure user exists in Supabase

### Issue: "Email not confirmed"
**Fix**:
- Disable email confirmation in Supabase settings
- Or manually confirm the user in Supabase dashboard

### Issue: "User not found"
**Fix**:
- User doesn't exist - need to sign up first
- Or create user manually in Supabase dashboard

## What to Share

Please share:
1. The **exact error message** from Network tab → Response
2. What you see in the **browser console** (after my code update)
3. Whether the user shows as **"Email confirmed"** in Supabase dashboard

This will help me pinpoint the exact issue!




