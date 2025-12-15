/**
 * Netlify Function: Process Reminders
 *
 * This function should be scheduled to run periodically (e.g., every hour)
 * It checks for due reminders and sends them via email/SMS based on user preferences
 *
 * TIMEZONE HANDLING:
 * - Netlify functions run in UTC timezone
 * - User reminder times are stored in their local timezone
 * - This function converts current UTC time to each user's local timezone
 * - Compares user's local time to their reminder time
 * - This ensures reminders fire at the correct local time for each user
 *
 * Environment Variables Required:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (needed to bypass RLS)
 * - EMAILJS_SERVICE_ID
 * - EMAILJS_PUBLIC_KEY
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_PHONE_NUMBER
 */

const { createClient } = require('@supabase/supabase-js')

exports.handler = async (event, context) => {
  console.log('========== PROCESS REMINDERS FUNCTION STARTED ==========')

  try {
    // Initialize Supabase with service role key (bypasses RLS)
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      hasEmailJsService: !!process.env.EMAILJS_SERVICE_ID,
      hasEmailJsPublic: !!process.env.EMAILJS_PUBLIC_KEY,
      hasEmailJsPrivate: !!process.env.EMAILJS_PRIVATE_KEY,
    })

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get current time
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`
    const currentDayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, etc.

    console.log('Current time (UTC):', {
      timestamp: now.toISOString(),
      time: currentTime,
      hour: currentHour,
      minute: currentMinute,
      dayOfWeek: currentDayOfWeek,
    })

    // Fetch all active reminders
    const { data: reminders, error: remindersError } = await supabase
      .from('reminders')
      .select('*')
      .eq('is_active', true)

    if (remindersError) {
      console.error('Error fetching reminders:', remindersError)
      throw remindersError
    }

    console.log(`Found ${reminders?.length || 0} active reminders`)

    if (!reminders || reminders.length === 0) {
      console.log('No active reminders to process, exiting')
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'No active reminders to process',
          processed: 0,
        }),
      }
    }

    console.log('Reminders to check:', reminders.map(r => ({
      id: r.id,
      type: r.reminder_type,
      frequency: r.frequency,
      time: r.time,
      days: r.days_of_week,
    })))

    let processed = 0
    let errors = []

    // Process each reminder
    for (const reminder of reminders) {
      try {
        console.log(`\n--- Processing reminder ${reminder.id} ---`)

        // Fetch user profile separately
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('communication_preferences, phone, email, first_name, timezone')
          .eq('user_id', reminder.user_id)
          .single()

        if (profileError || !profile) {
          console.error(`Could not find profile for user ${reminder.user_id}`, profileError)
          continue
        }

        console.log('User profile found:', {
          email: profile.email,
          timezone: profile.timezone,
          hasPrefs: !!profile.communication_preferences,
        })

        const prefs = profile.communication_preferences || {}

        // Check if reminders are enabled
        if (!prefs.reminders?.enabled) {
          console.log('Reminders not enabled for this user, skipping')
          continue
        }

        console.log('Communication preferences:', {
          enabled: prefs.reminders?.enabled,
          method: prefs.reminders?.method,
          startTime: prefs.reminders?.start_time,
          endTime: prefs.reminders?.end_time,
        })

        // Get user's local time based on their timezone
        const userTimezone = profile.timezone || 'UTC'
        const userLocalTime = getUserLocalTime(now, userTimezone)
        const userDayOfWeek = userLocalTime.getDay()
        const userTimeString = `${String(userLocalTime.getHours()).padStart(2, '0')}:${String(userLocalTime.getMinutes()).padStart(2, '0')}`

        console.log('User local time:', {
          timezone: userTimezone,
          time: userTimeString,
          dayOfWeek: userDayOfWeek,
          fullTimestamp: userLocalTime.toISOString(),
        })

        // Check if reminder is due based on frequency and time
        const isDue = checkReminderDue(reminder, userTimeString, userDayOfWeek, prefs.reminders)

        console.log('Is reminder due?', isDue)

        if (!isDue) {
          console.log('Reminder not due yet, skipping')
          continue
        }

        // Check if already sent today in user's local timezone (to avoid duplicates)
        const userLocalDate = userLocalTime.toISOString().split('T')[0]
        const { data: existingLog } = await supabase
          .from('reminder_logs')
          .select('id')
          .eq('reminder_id', reminder.id)
          .eq('date', userLocalDate)
          .eq('status', 'sent')
          .limit(1)

        console.log('Duplicate check:', {
          userLocalDate,
          existingLog: existingLog?.length || 0,
        })

        if (existingLog && existingLog.length > 0) {
          console.log('Already sent today, skipping')
          continue // Already sent today
        }

        // Prepare reminder message
        const reminderType = reminder.type || reminder.reminder_type || 'Reminder'
        const reminderMessage = reminder.message || `Reminder: ${reminderType}`
        const userName = profile.first_name || 'User'

        console.log('Preparing to send reminder:', {
          type: reminderType,
          message: reminderMessage,
          userName,
        })

        // Send based on user preferences
        const method = prefs.reminders?.method || 'email'
        let sent = false

        console.log('Sending method:', method)

        if (method === 'email' || method === 'both') {
          console.log('Sending email to:', profile.email)
          await sendEmailReminder(profile.email, userName, reminderMessage, reminderType)
          sent = true
          console.log('Email sent successfully')
        }

        if (method === 'sms' || method === 'both') {
          if (profile.phone) {
            console.log('Sending SMS to:', profile.phone)
            await sendSMSReminder(profile.phone, reminderMessage)
            sent = true
            console.log('SMS sent successfully')
          } else {
            console.log('SMS requested but no phone number available')
          }
        }

        if (sent) {
          console.log('Logging reminder send to database')
          // Log the reminder with user's local time
          const userLocalDate = userLocalTime.toISOString().split('T')[0]
          await supabase
            .from('reminder_logs')
            .insert({
              reminder_id: reminder.id,
              user_id: reminder.user_id,
              date: userLocalDate,
              time: userTimeString,
              status: 'sent',
              method: method,
            })

          processed++
          console.log(`✓ Reminder ${reminder.id} processed successfully`)
        }
      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error)
        errors.push({ reminder_id: reminder.id, error: error.message })
      }
    }

    console.log('\n========== SUMMARY ==========')
    console.log(`Total reminders checked: ${reminders.length}`)
    console.log(`Successfully processed: ${processed}`)
    console.log(`Errors: ${errors.length}`)
    console.log('========== PROCESS REMINDERS FUNCTION ENDED ==========\n')

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        processed,
        errors: errors.length > 0 ? errors : undefined,
      }),
    }
  } catch (error) {
    console.error('FATAL ERROR processing reminders:', error)
    console.log('========== PROCESS REMINDERS FUNCTION ENDED WITH ERROR ==========\n')
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to process reminders',
        message: error.message,
      }),
    }
  }
}

/**
 * Convert UTC time to user's local time based on their timezone
 */
function getUserLocalTime(utcDate, timezone) {
  try {
    // Use Intl.DateTimeFormat to convert to user's timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })

    const parts = formatter.formatToParts(utcDate)
    const dateParts = {}

    parts.forEach(part => {
      if (part.type !== 'literal') {
        dateParts[part.type] = part.value
      }
    })

    // Create a new Date object in the user's timezone
    // Note: This creates a Date in UTC but with the values from the user's timezone
    return new Date(
      `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}:${dateParts.second}Z`
    )
  } catch (error) {
    console.error('Error converting timezone:', error)
    // Fallback to UTC if timezone conversion fails
    return utcDate
  }
}

/**
 * Check if a reminder is due based on frequency and time
 *
 * Reminder can be:
 * - "hourly": fires every hour on the hour within active window (uses comm prefs)
 * - "one-off": fires at specific reminder.time (ignores comm prefs frequency)
 */
function checkReminderDue(reminder, currentTime, currentDayOfWeek, prefs) {
  const [curHour, curMin] = currentTime.split(':').map(Number)

  // Check if today is a scheduled day (if days_of_week is specified)
  if (reminder.days_of_week && reminder.days_of_week.length > 0) {
    if (!reminder.days_of_week.includes(currentDayOfWeek)) {
      return false // Not scheduled for today
    }
  }

  // Determine reminder frequency
  // Check reminder.frequency field first, fallback to 'one-off' if not set
  const reminderFrequency = reminder.frequency || 'one-off'

  if (reminderFrequency === 'hourly') {
    // HOURLY: Use global settings from communication_preferences
    const startTime = prefs.start_time || '08:00'
    const endTime = prefs.end_time || '22:00'

    // Check if current time is within active hours
    if (currentTime < startTime || currentTime > endTime) {
      return false
    }

    // Fire at top of every hour (XX:00 or within 5 min tolerance)
    return curMin <= 5 // Within 5 minutes of top of hour
  } else {
    // ONE-OFF: Use specific reminder time
    const reminderTime = reminder.time || '08:00'

    // Check if reminder time matches (within 5 minutes tolerance)
    const [remHour, remMin] = reminderTime.split(':').map(Number)
    const remMinutes = remHour * 60 + remMin
    const curMinutes = curHour * 60 + curMin
    const timeDiff = Math.abs(curMinutes - remMinutes)

    return timeDiff <= 5 // Within 5 minutes of reminder time
  }
}

/**
 * Send email reminder via EmailJS
 */
async function sendEmailReminder(toEmail, userName, message, reminderType) {
  const { sendReminderEmail } = require('./lib/emailService')
  return sendReminderEmail(toEmail, userName, message, reminderType)
}

/**
 * Send SMS reminder via Twilio
 */
async function sendSMSReminder(toPhone, message) {
  const twilio = require('twilio')
  
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromPhone = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !fromPhone) {
    throw new Error('Twilio not configured')
  }

  const client = twilio(accountSid, authToken)

  await client.messages.create({
    body: `MenoEase Reminder: ${message}`,
    from: fromPhone,
    to: toPhone,
  })
}

