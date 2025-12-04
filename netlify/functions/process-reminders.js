/**
 * Netlify Function: Process Reminders
 * 
 * This function should be scheduled to run periodically (e.g., every hour)
 * It checks for due reminders and sends them via email/SMS based on user preferences
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
  try {
    // Initialize Supabase with service role key (bypasses RLS)
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

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

    // Fetch all active reminders
    const { data: reminders, error: remindersError } = await supabase
      .from('reminders')
      .select('*, user_profiles!inner(communication_preferences, phone, email, first_name)')
      .eq('is_active', true)

    if (remindersError) {
      throw remindersError
    }

    if (!reminders || reminders.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'No active reminders to process',
          processed: 0,
        }),
      }
    }

    let processed = 0
    let errors = []

    // Process each reminder
    for (const reminder of reminders) {
      try {
        const profile = reminder.user_profiles
        const prefs = profile.communication_preferences || {}

        // Check if reminders are enabled
        if (!prefs.reminders?.enabled) {
          continue
        }

        // Check if reminder is due based on frequency and time
        const isDue = checkReminderDue(reminder, currentTime, currentDayOfWeek, prefs.reminders)
        
        if (!isDue) {
          continue
        }

        // Check if already sent today (to avoid duplicates)
        const today = now.toISOString().split('T')[0]
        const { data: existingLog } = await supabase
          .from('reminder_logs')
          .select('id')
          .eq('reminder_id', reminder.id)
          .eq('date', today)
          .eq('status', 'sent')
          .limit(1)

        if (existingLog && existingLog.length > 0) {
          continue // Already sent today
        }

        // Prepare reminder message
        const reminderMessage = reminder.message || `Reminder: ${reminder.reminder_type}`
        const userName = profile.first_name || 'User'

        // Send based on user preferences
        const method = prefs.reminders.method || 'email'
        let sent = false

        if (method === 'email' || method === 'both') {
          await sendEmailReminder(profile.email, userName, reminderMessage, reminder.reminder_type)
          sent = true
        }

        if (method === 'sms' || method === 'both') {
          if (profile.phone) {
            await sendSMSReminder(profile.phone, reminderMessage)
            sent = true
          }
        }

        if (sent) {
          // Log the reminder
          await supabase
            .from('reminder_logs')
            .insert({
              reminder_id: reminder.id,
              user_id: reminder.user_id,
              date: today,
              time: currentTime,
              status: 'sent',
              method: method,
            })

          processed++
        }
      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error)
        errors.push({ reminder_id: reminder.id, error: error.message })
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        processed,
        errors: errors.length > 0 ? errors : undefined,
      }),
    }
  } catch (error) {
    console.error('Error processing reminders:', error)
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
 * Check if a reminder is due based on frequency and time
 */
function checkReminderDue(reminder, currentTime, currentDayOfWeek, prefs) {
  const reminderTime = reminder.time || '08:00'
  const frequency = prefs.frequency || 'daily'
  const startTime = prefs.start_time || '07:00'
  const endTime = prefs.end_time || '22:00'

  // Check if current time is within active hours
  if (currentTime < startTime || currentTime > endTime) {
    return false
  }

  // Check if reminder time matches (within 5 minutes tolerance)
  const [remHour, remMin] = reminderTime.split(':').map(Number)
  const [curHour, curMin] = currentTime.split(':').map(Number)
  const remMinutes = remHour * 60 + remMin
  const curMinutes = curHour * 60 + curMin
  const timeDiff = Math.abs(curMinutes - remMinutes)

  if (timeDiff > 5) {
    return false // Not within 5 minutes of reminder time
  }

  // Check frequency
  if (frequency === 'daily') {
    return true
  } else if (frequency === 'hourly') {
    return curMin === 0 // Send at top of every hour
  } else if (frequency === 'every_2_hours') {
    return curMin === 0 && curHour % 2 === 0
  } else if (frequency === 'every_3_hours') {
    return curMin === 0 && curHour % 3 === 0
  } else if (frequency === 'twice_daily') {
    // Send at reminder time and reminder time + 12 hours
    return true // Already checked time match above
  }

  return false
}

/**
 * Send email reminder via EmailJS
 */
async function sendEmailReminder(toEmail, userName, message, reminderType) {
  const emailjs = require('@emailjs/nodejs')
  
  const serviceId = process.env.EMAILJS_SERVICE_ID
  // Template ID should be set in Netlify env vars (e.g., "Meno_Reminder")
  const templateId = process.env.EMAILJS_TEMPLATE_REMINDER || 'Meno_Reminder'
  const publicKey = process.env.EMAILJS_PUBLIC_KEY

  if (!serviceId || !templateId || !publicKey) {
    throw new Error('EmailJS not configured')
  }

  const now = new Date()
  const date = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  // Variables match the {{variable}} names in the HTML template
  await emailjs.send(
    serviceId,
    templateId,
    {
      to_email: toEmail,
      to_name: userName,
      user_name: userName,
      reminder_type: reminderType,
      reminder_message: message,
      date,
      time,
    },
    { publicKey }
  )
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

