# Supabase Database Setup Guide

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: MenoTrak (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine to start
5. Click "Create new project"
6. Wait 2-3 minutes for project to initialize

## Step 2: Get Your Project Credentials

1. In your Supabase project dashboard, go to **Settings** (gear icon)
2. Click **API** in the left sidebar
3. You'll see:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
4. Copy both of these - you'll need them for environment variables

## Step 3: Run the Database Schema

1. In Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `supabase/schema.sql` from this project
4. Copy the **entire contents** of that file
5. Paste it into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

## Step 4: Verify Tables Were Created

1. Click **Table Editor** in the left sidebar
2. You should see these tables:
   - `sleep_logs`
   - `food_items`
   - `food_logs`
   - `symptoms`
   - `medications`
   - `medication_logs`
   - `exercises`
   - `mood_logs`
   - `journal_entries`
   - `weather_data`
   - `insights`
   - `user_settings`

## Step 5: Verify Row Level Security (RLS)

1. In **Table Editor**, click on any table (e.g., `sleep_logs`)
2. Click the **Policies** tab
3. You should see policies like "Users can view own sleep logs"
4. All tables should have RLS enabled (indicated by a lock icon)

## Step 6: Set Up Authentication

1. Go to **Authentication** > **Settings**
2. Under **Site URL**, add:
   - Development: `http://localhost:3000`
   - Production: Your Netlify URL (e.g., `https://your-app.netlify.app`)
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/**`
   - `https://your-app.netlify.app/**`
4. Enable **Email** provider (should be enabled by default)
5. Configure email templates if desired (optional)

## Step 7: Set Up Storage (for PDF Reports)

1. Go to **Storage** in the left sidebar
2. Click **Create a new bucket**
3. Name: `reports`
4. Make it **Private**
5. Click **Create bucket**
6. Go to **Policies** tab
7. Create a policy:
   - Policy name: "Users can upload own reports"
   - Allowed operation: INSERT
   - Target roles: authenticated
   - Policy definition: `bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]`
8. Create another policy:
   - Policy name: "Users can read own reports"
   - Allowed operation: SELECT
   - Same conditions

## Step 8: Add Environment Variables to Netlify

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** > **Environment variables**
4. Add these variables:

### Required:
- `VITE_SUPABASE_URL` = Your Supabase Project URL
- `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key

### Optional (add as you set them up):
- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_PUBLIC_KEY`
- `VITE_EMAILJS_TEMPLATE_ID_WELCOME`
- `VITE_EMAILJS_TEMPLATE_ID_SUMMARY`
- `VITE_EMAILJS_TEMPLATE_ID_REPORT`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_WEATHER_API_KEY`
- `VITE_APP_URL` = Your Netlify URL

5. Click **Save**

## Step 9: Test the Connection

1. In your local project, create a `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

2. Run locally:
   ```bash
   npm install
   npm run dev
   ```

3. Try signing up a test user
4. Check Supabase **Authentication** > **Users** to see if user was created

## Troubleshooting

### "relation does not exist" error
- Make sure you ran the entire `schema.sql` file
- Check that all tables appear in Table Editor

### "new row violates row-level security policy"
- Verify RLS policies are created
- Check that user is authenticated
- Verify policies allow the operation you're trying

### Authentication not working
- Check redirect URLs in Supabase Auth settings
- Verify Site URL matches your app URL
- Check browser console for errors

### Can't see tables
- Refresh the Table Editor
- Check SQL Editor for any error messages
- Verify you're in the correct project

## Next Steps After Setup

1. ✅ Database is ready
2. ✅ Authentication is configured
3. ✅ Environment variables are set
4. 🚀 Start implementing features!




