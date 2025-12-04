# MenoTrak Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   - Copy `env.example` to `.env`
   - Fill in your API keys and configuration

3. **Set Up Supabase**
   - Create a new Supabase project at https://supabase.com
   - Go to SQL Editor
   - Run the SQL from `supabase/schema.sql`
   - Copy your project URL and anon key to `.env`

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Supabase Setup Details

### 1. Create Project
- Sign up/login at https://supabase.com
- Create a new project
- Note your project URL and anon key

### 2. Run Database Schema
- Open SQL Editor in Supabase dashboard
- Copy and paste the entire contents of `supabase/schema.sql`
- Execute the script
- Verify tables are created in the Table Editor

### 3. Configure Authentication
- Go to Authentication > Settings
- Enable Email provider
- Configure email templates if desired
- Set up redirect URLs for your domain

### 4. Set Up Storage (for PDF reports)
- Go to Storage
- Create a bucket named `reports`
- Set it to private
- Add RLS policies for user access

## EmailJS Setup

1. Sign up at https://www.emailjs.com
2. Create an email service (Gmail, Outlook, etc.)
3. Create email templates:
   - Welcome email
   - Weekly summary
   - PDF report delivery
4. Copy Service ID, Public Key, and Template IDs to `.env`

## Twilio Setup (Optional)

1. Sign up at https://www.twilio.com
2. Get a phone number
3. Copy Account SID, Auth Token, and Phone Number to `.env`
4. For production, set up Twilio Functions or Netlify Functions for SMS

## Stripe Setup (Optional)

1. Sign up at https://stripe.com
2. Get your publishable key from the dashboard
3. Copy to `VITE_STRIPE_PUBLISHABLE_KEY` in `.env`
4. For production, set up webhook endpoints

## Weather API Setup

1. Sign up at https://openweathermap.org/api
2. Get your free API key
3. Copy to `VITE_WEATHER_API_KEY` in `.env`

## Netlify Deployment

1. Push your code to GitHub
2. Sign up/login at https://netlify.com
3. Click "New site from Git"
4. Connect your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables in Site settings > Environment variables
7. Deploy!

## Troubleshooting

### Supabase Connection Issues
- Verify your URL and anon key are correct
- Check that RLS policies are set up
- Ensure your Supabase project is active

### Environment Variables Not Working
- Restart your dev server after changing `.env`
- Make sure variables start with `VITE_` for Vite
- Check for typos in variable names

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (should be 18+)
- Clear `node_modules` and reinstall if needed

## Next Steps

After setup:
1. Test authentication (sign up/login)
2. Test creating a sleep log
3. Test dashboard data loading
4. Implement remaining features one by one




