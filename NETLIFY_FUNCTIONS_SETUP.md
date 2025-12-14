# Netlify Functions Setup Guide

This guide explains how to configure and troubleshoot the MenoEase Netlify functions for email and SMS reminders.

## Overview

MenoEase uses three Netlify functions for reminder functionality:

1. **process-reminders.js** - Scheduled function that runs periodically to check and send due reminders
2. **send-email.js** - Sends email via EmailJS
3. **send-sms.js** - Sends SMS via Twilio

## Required Environment Variables

You need to set these environment variables in your Netlify dashboard:

### Supabase (Required)
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Where to find:**
- Go to your Supabase project dashboard
- Project Settings → API
- Copy the URL and keys

### EmailJS (Required for Email Reminders)
```
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
EMAILJS_TEMPLATE_REMINDER=your_template_id
```

**How to set up:**
1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Create an account if you don't have one
3. Add an email service (Gmail, Outlook, etc.)
4. Create a template called "Meno_Reminder" or similar
5. Get your Service ID and Public Key from the dashboard

**Template Variables:**
Your EmailJS template should include these variables:
- `{{to_email}}` - Recipient email
- `{{to_name}}` - Recipient name
- `{{message}}` - Reminder message
- `{{reminder_type}}` - Type of reminder
- `{{date}}` - Current date
- `{{time}}` - Current time

### Twilio (Required for SMS Reminders)
```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

**How to set up:**
1. Go to [Twilio Console](https://console.twilio.com/)
2. Create an account (free trial available)
3. Get a phone number
4. Copy your Account SID and Auth Token from the dashboard

---

## Setting Environment Variables in Netlify

1. Go to your Netlify site dashboard
2. Click **Site configuration** → **Environment variables**
3. Click **Add a variable**
4. Add each variable from the lists above
5. Make sure to select the appropriate scopes (usually "All deploy contexts")

---

## Configuring the Scheduled Function

The `process-reminders` function needs to run periodically to check for due reminders.

### Option 1: Netlify Scheduled Functions (Recommended)

Netlify now supports scheduled functions via `netlify.toml`:

```toml
[functions."process-reminders"]
  schedule = "*/5 * * * *"  # Run every 5 minutes
```

This is already configured in the `netlify.toml` file.

### Option 2: Manual Configuration in Netlify UI

1. Go to your Netlify site dashboard
2. Navigate to **Functions** tab
3. Find `process-reminders`
4. Click **Edit settings**
5. Enable **Background function** or **Scheduled function**
6. Set schedule: `*/5 * * * *` (every 5 minutes)

---

## Testing the Functions

### Test Email Function

You can test the email function using curl or a tool like Postman:

```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "test@example.com",
    "to_name": "Test User",
    "template_id": "your_template_id",
    "template_params": {
      "message": "Test message",
      "reminder_type": "Test"
    }
  }'
```

### Test SMS Function

```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "to_phone": "+1234567890",
    "message": "Test SMS from MenoEase"
  }'
```

### Test Process Reminders

The scheduled function runs automatically, but you can manually trigger it:

```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/process-reminders
```

---

## Troubleshooting

### Reminders Not Sending

**Check 1: Environment Variables**
- Verify all required environment variables are set in Netlify
- Check for typos in variable names
- Make sure variables are available in all deploy contexts

**Check 2: Function Logs**
1. Go to Netlify dashboard → Functions
2. Click on the function name
3. View the logs to see errors

**Check 3: User Settings**
- Check that users have valid email/phone numbers in their profiles
- Verify communication preferences are enabled
- Check timezone is set correctly in user profile

**Check 4: Reminder Configuration**
- Verify reminders are set to `is_active = true` in database
- Check reminder times are set correctly
- Verify `days_of_week` array is correct (0=Sunday, 6=Saturday)

**Check 5: Scheduled Function**
- Verify the scheduled function is enabled in Netlify
- Check the cron schedule is correct
- Look for function execution logs in Netlify

### Common Errors

**"EmailJS not configured"**
- Missing EmailJS environment variables
- Check `EMAILJS_SERVICE_ID`, `EMAILJS_PUBLIC_KEY`, `EMAILJS_TEMPLATE_REMINDER`

**"SMS service not configured"**
- Missing Twilio environment variables
- Check `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

**"Reminder sent within the last hour"**
- This is normal - duplicate check prevents sending same reminder multiple times
- Wait 1 hour and try again, or check a different reminder

**"No reminders found"**
- User has no active reminders in database
- Check `reminders` table in Supabase

---

## Database Schema

The `reminders` table should have this structure:

```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  time TIME NOT NULL,
  days_of_week INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own reminders"
  ON reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders"
  ON reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
  ON reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
  ON reminders FOR DELETE
  USING (auth.uid() = user_id);
```

The `user_profiles` table needs:
- `communication_preferences` JSONB (with `sms_enabled`, `email_enabled`, `reminders` fields)
- `phone` TEXT
- `email` TEXT
- `first_name` TEXT
- `timezone` TEXT

---

## Support

If you continue to have issues:

1. Check Netlify function logs for detailed error messages
2. Verify all environment variables are correctly set
3. Test individual functions with curl commands
4. Check Supabase database for reminder records
5. Verify user profiles have correct contact information

For further assistance, check the Netlify and EmailJS/Twilio documentation.
