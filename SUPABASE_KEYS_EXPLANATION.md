# Supabase Keys Explanation

## Which Keys to Use Where

### ✅ For Frontend (React App) - USE THESE:

1. **Project URL** → `VITE_SUPABASE_URL`
   - This is your Supabase project URL
   - Example: `https://xxxxx.supabase.co`
   - Safe to expose in frontend code

2. **anon/public key** (also called "publishable key") → `VITE_SUPABASE_ANON_KEY`
   - This is the key that starts with `eyJ...`
   - It's safe to use in frontend/browser
   - It respects Row Level Security (RLS) policies
   - This is what you should use in your React app

### ❌ NEVER Use in Frontend:

**service_role key** (also called "secret key")
- This key **bypasses all security** including RLS
- Should ONLY be used in:
  - Server-side code (Netlify Functions, API routes)
  - Backend services
  - Admin operations
- **NEVER** put this in your React app or `.env` file that gets bundled
- If exposed, anyone can access/modify all data in your database

## Where to Find Them in Supabase

1. Go to your Supabase project dashboard
2. Click **Settings** (gear icon) → **API**
3. You'll see:

### Project URL
- Copy this for `VITE_SUPABASE_URL`

### Project API keys
- **anon public** → Use this for `VITE_SUPABASE_ANON_KEY` ✅
- **service_role** → Keep this secret, only for backend ❌

## Environment Variables Setup

### For Local Development (`.env` file):
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### For Netlify:
Add these in **Site settings** → **Environment variables**:
- `VITE_SUPABASE_URL` = Your Project URL
- `VITE_SUPABASE_ANON_KEY` = Your anon/public key

## Security Notes

✅ **Safe to use in frontend:**
- Project URL
- anon/public key

❌ **Never expose:**
- service_role key
- Database password
- Any other secret keys

## How It Works

The **anon key** is designed for frontend use because:
1. It respects Row Level Security (RLS) policies
2. Users can only access data they're allowed to see
3. It's safe to bundle with your React app
4. It's what our `src/config/supabase.js` uses

The **service_role key** bypasses RLS and should only be used in secure server environments.




