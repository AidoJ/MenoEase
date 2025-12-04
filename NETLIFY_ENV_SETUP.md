# Netlify Environment Variables Setup

## The Error You're Seeing

```
supabase.js:7 Uncaught Error: Missing Supabase environment variables
```

This means Netlify can't find your environment variables. Here's how to fix it:

## Step 1: Verify Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Make sure you have these EXACT variable names:

   ```
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   ```

   ⚠️ **IMPORTANT:** 
   - Variable names MUST start with `VITE_` for Vite to include them
   - They are case-sensitive
   - No spaces or extra characters

## Step 2: Check the Values

Click on each variable to verify:
- `VITE_SUPABASE_URL` should be: `https://xxxxx.supabase.co` (your actual URL)
- `VITE_SUPABASE_ANON_KEY` should be: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your actual key)

**Common mistakes:**
- ❌ Using `SUPABASE_URL` instead of `VITE_SUPABASE_URL`
- ❌ Using `SUPABASE_KEY` instead of `VITE_SUPABASE_ANON_KEY`
- ❌ Leaving placeholder values like "your_supabase_project_url"
- ❌ Extra spaces or quotes around values

## Step 3: Trigger a New Build

After adding/updating environment variables:

1. Go to **Deploys** tab in Netlify
2. Click **Trigger deploy** → **Clear cache and deploy site**
3. Wait for the build to complete
4. Try accessing your site again

## Step 4: Verify Build Logs

1. Go to **Deploys** tab
2. Click on the latest deploy
3. Check the build logs for any errors
4. Look for messages about environment variables

## Quick Checklist

- [ ] Environment variables are named `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [ ] Values are actual Supabase credentials (not placeholders)
- [ ] No extra spaces or quotes in values
- [ ] Triggered a new deploy after adding variables
- [ ] Build completed successfully

## Alternative: Add Variables via netlify.toml

You can also add them in `netlify.toml` (but this is less secure for production):

```toml
[build.environment]
  VITE_SUPABASE_URL = "https://your-project.supabase.co"
  VITE_SUPABASE_ANON_KEY = "your-key-here"
```

⚠️ **Note:** Don't commit actual keys to GitHub! Use Netlify dashboard instead.

## Still Not Working?

1. **Check browser console** - What's the exact error?
2. **Check Netlify build logs** - Any build errors?
3. **Verify Supabase project** - Is it active and accessible?
4. **Try redeploying** - Clear cache and redeploy




