# Netlify Environment Variables Setup

This document lists all environment variables that need to be added to your Netlify site settings.

## How to Add Variables in Netlify

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Click **Add variable** for each variable below
4. After adding all variables, **redeploy your site** for changes to take effect

---

## Required Environment Variables

### Supabase (Already Set - Frontend)
These should already be set from initial setup:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

### Supabase (Backend Functions - NEW)
These are needed for serverless functions to access the database:
- `SUPABASE_URL` - Same as VITE_SUPABASE_URL (without VITE_ prefix)
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service_role key (NOT the anon key!)
  - ⚠️ **Important**: This is a secret key. Get it from Supabase Dashboard → Settings → API → service_role key

### EmailJS Configuration
- `EMAILJS_SERVICE_ID` - Your EmailJS Service ID
  - Get from: EmailJS Dashboard → Email Services
- `EMAILJS_PUBLIC_KEY` - Your EmailJS Public Key
  - Get from: EmailJS Dashboard → Account → API Keys → Public Key

### EmailJS Template IDs
These are the Template IDs you set when creating templates in EmailJS (must be ≤24 characters):
- `EMAILJS_TEMPLATE_REMINDER` = `Meno_Reminder`
- `EMAILJS_TEMPLATE_REPORT_DAILY` = `Meno_ReportDaily`
- `EMAILJS_TEMPLATE_REPORT_WEEKLY` = `Meno_ReportWeekly`
- `EMAILJS_TEMPLATE_REPORT_MONTHLY` = `Meno_ReportMonthly`
- `EMAILJS_TEMPLATE_WELCOME` = `Meno_Welcome`
- `EMAILJS_TEMPLATE_UPGRADE` = `Meno_Upgrade`
- `EMAILJS_TEMPLATE_DOWNGRADE` = `Meno_Downgrade`
- `EMAILJS_TEMPLATE_CANCELLED` = `Meno_Cancelled`

### Twilio Configuration (for SMS)
- `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
  - Get from: Twilio Console → Account Info
- `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
  - Get from: Twilio Console → Account Info
- `TWILIO_PHONE_NUMBER` - Your Twilio phone number (format: +1234567890)
  - Get from: Twilio Console → Phone Numbers → Manage → Active numbers

### Stripe Configuration (for Subscriptions - Future)
- `STRIPE_SECRET_KEY` - Your Stripe Secret Key (starts with `sk_`)
  - Get from: Stripe Dashboard → Developers → API keys
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe Publishable Key (starts with `pk_`)
  - Get from: Stripe Dashboard → Developers → API keys
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (for subscription events)
  - Get from: Stripe Dashboard → Developers → Webhooks → Add endpoint → Signing secret

---

## Quick Reference Table

| Variable Name | Example Value | Where to Get It |
|--------------|---------------|-----------------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` (long JWT) | Supabase Dashboard → Settings → API → service_role key |
| `EMAILJS_SERVICE_ID` | `service_xxxxx` | EmailJS Dashboard → Email Services |
| `EMAILJS_PUBLIC_KEY` | `xxxxx` | EmailJS Dashboard → Account → API Keys |
| `EMAILJS_TEMPLATE_REMINDER` | `Meno_Reminder` | EmailJS Dashboard → Templates (the Template ID you set) |
| `EMAILJS_TEMPLATE_REPORT_DAILY` | `Meno_ReportDaily` | EmailJS Dashboard → Templates |
| `EMAILJS_TEMPLATE_REPORT_WEEKLY` | `Meno_ReportWeekly` | EmailJS Dashboard → Templates |
| `EMAILJS_TEMPLATE_REPORT_MONTHLY` | `Meno_ReportMonthly` | EmailJS Dashboard → Templates |
| `EMAILJS_TEMPLATE_WELCOME` | `Meno_Welcome` | EmailJS Dashboard → Templates |
| `EMAILJS_TEMPLATE_UPGRADE` | `Meno_Upgrade` | EmailJS Dashboard → Templates |
| `EMAILJS_TEMPLATE_DOWNGRADE` | `Meno_Downgrade` | EmailJS Dashboard → Templates |
| `EMAILJS_TEMPLATE_CANCELLED` | `Meno_Cancelled` | EmailJS Dashboard → Templates |
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxxxxxxx` | Twilio Console → Account Info |
| `TWILIO_AUTH_TOKEN` | `xxxxxxxxxxxxx` | Twilio Console → Account Info |
| `TWILIO_PHONE_NUMBER` | `+1234567890` | Twilio Console → Phone Numbers |

---

## Important Notes

1. **VITE_ Prefix**: Variables used in the frontend (React app) must have the `VITE_` prefix. Variables used only in Netlify Functions do NOT need the prefix.

2. **Service Role Key**: The `SUPABASE_SERVICE_ROLE_KEY` is a secret key that bypasses Row Level Security. Keep it secure and never expose it in the frontend code.

3. **Template IDs**: These should match exactly what you set in EmailJS when creating the templates (e.g., `Meno_Reminder`, `Meno_ReportDaily`, etc.)

4. **After Adding Variables**: 
   - Save all variables
   - Go to **Deploys** tab
   - Click **Trigger deploy** → **Clear cache and deploy site**
   - This ensures all functions get the new environment variables

5. **Testing**: After deployment, you can test the functions by:
   - Checking Netlify Function logs (Site → Functions → View logs)
   - Testing reminder processing manually (if you set up scheduled functions)

---

## Optional: Scheduled Functions Setup

To automatically process reminders and generate reports, you'll need to set up scheduled functions in Netlify:

1. Go to **Site settings** → **Functions**
2. For `process-reminders`: Set schedule to run every hour (cron: `0 * * * *`)
3. For `generate-reports`: Set schedule to run daily at 5 PM (cron: `0 17 * * *`)

Or use Netlify's Scheduled Functions feature (requires Netlify Pro plan) or external cron services.




