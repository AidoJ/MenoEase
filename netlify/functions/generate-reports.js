/**
 * Netlify Function: Generate and Send Reports
 * 
 * This function should be scheduled to run daily (e.g., at 5 PM)
 * It generates reports based on user preferences and sends them via email/SMS
 * 
 * Environment Variables Required:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - EMAILJS_SERVICE_ID
 * - EMAILJS_PUBLIC_KEY
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_PHONE_NUMBER
 */

const { createClient } = require('@supabase/supabase-js')
const { format, subDays, startOfWeek, startOfMonth } = require('date-fns')

exports.handler = async (event, context) => {
  try {
    // Initialize Supabase
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const currentDayOfWeek = now.getDay()
    const currentDayOfMonth = now.getDate()

    // Fetch all users with reports enabled
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .not('communication_preferences', 'is', null)

    if (profilesError) {
      throw profilesError
    }

    if (!profiles || profiles.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'No users with reports enabled',
          processed: 0,
        }),
      }
    }

    let processed = 0
    let errors = []

    for (const profile of profiles) {
      try {
        const prefs = profile.communication_preferences || {}

        // Check if reports are enabled
        if (!prefs.reports?.enabled) {
          continue
        }

        // Check if report is due
        const isDue = checkReportDue(prefs.reports, currentTime, currentDayOfWeek, currentDayOfMonth)
        
        if (!isDue) {
          continue
        }

        // Generate report data
        const reportData = await generateReportData(supabase, profile.user_id, prefs.reports.frequency)

        // Send report
        const method = prefs.reports.method || 'email'
        const userName = profile.first_name || 'User'

        if (method === 'email' || method === 'both') {
          await sendEmailReport(profile.email, userName, prefs.reports.frequency, reportData)
        }

        if (method === 'sms' || method === 'both') {
          if (profile.phone) {
            await sendSMSReport(profile.phone, prefs.reports.frequency, reportData)
          }
        }

        processed++
      } catch (error) {
        console.error(`Error processing report for user ${profile.user_id}:`, error)
        errors.push({ user_id: profile.user_id, error: error.message })
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
    console.error('Error generating reports:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to generate reports',
        message: error.message,
      }),
    }
  }
}

/**
 * Check if a report is due based on frequency and timing
 */
function checkReportDue(reportPrefs, currentTime, currentDayOfWeek, currentDayOfMonth) {
  const frequency = reportPrefs.frequency
  const reportTime = reportPrefs.time || '17:00'

  // Check if current time matches report time (within 5 minutes)
  const [repHour, repMin] = reportTime.split(':').map(Number)
  const [curHour, curMin] = currentTime.split(':').map(Number)
  const repMinutes = repHour * 60 + repMin
  const curMinutes = curHour * 60 + curMin
  const timeDiff = Math.abs(curMinutes - repMinutes)

  if (timeDiff > 5) {
    return false
  }

  // Check frequency
  if (frequency === 'daily') {
    return true
  } else if (frequency === 'weekly') {
    const preferredDay = reportPrefs.day_of_week || 1 // Monday by default
    return currentDayOfWeek === preferredDay
  } else if (frequency === 'monthly') {
    const preferredDay = reportPrefs.day_of_month || 1
    return currentDayOfMonth === preferredDay
  }

  return false
}

/**
 * Generate report data for a user
 */
async function generateReportData(supabase, userId, frequency) {
  const now = new Date()
  let startDate
  let periodLabel

  if (frequency === 'daily') {
    startDate = format(now, 'yyyy-MM-dd')
    periodLabel = 'Today'
  } else if (frequency === 'weekly') {
    startDate = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    periodLabel = 'This Week'
  } else if (frequency === 'monthly') {
    startDate = format(startOfMonth(now), 'yyyy-MM-dd')
    periodLabel = 'This Month'
  } else {
    startDate = format(subDays(now, 7), 'yyyy-MM-dd')
    periodLabel = 'Last 7 Days'
  }

  const endDate = format(now, 'yyyy-MM-dd')

  // Fetch data
  const [sleepLogs, moodLogs, foodLogs, symptomLogs] = await Promise.all([
    supabase.from('sleep_logs').select('*').eq('user_id', userId).gte('date', startDate).lte('date', endDate),
    supabase.from('mood_logs').select('*').eq('user_id', userId).gte('date', startDate).lte('date', endDate),
    supabase.from('food_logs').select('*').eq('user_id', userId).gte('date', startDate).lte('date', endDate),
    supabase.from('symptoms').select('*').eq('user_id', userId).gte('date', startDate).lte('date', endDate),
  ])

  // Calculate statistics
  const avgEnergy = moodLogs.data?.length > 0
    ? (moodLogs.data.reduce((sum, m) => sum + (m.energy_level || 0), 0) / moodLogs.data.length).toFixed(1)
    : 'N/A'

  const symptomDays = new Set(symptomLogs.data?.map(s => s.date) || []).size
  const mealsLogged = foodLogs.data?.length || 0

  // Format report HTML
  const reportHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h3 style="color: #7b5bd4;">${periodLabel} Summary</h3>
      <ul style="list-style: none; padding: 0;">
        <li style="margin: 8px 0;"><strong>Average Energy Level:</strong> ${avgEnergy}/11</li>
        <li style="margin: 8px 0;"><strong>Days with Symptoms:</strong> ${symptomDays}</li>
        <li style="margin: 8px 0;"><strong>Meals Logged:</strong> ${mealsLogged}</li>
        <li style="margin: 8px 0;"><strong>Mood Entries:</strong> ${moodLogs.data?.length || 0}</li>
      </ul>
    </div>
  `

  return {
    period: periodLabel,
    html: reportHtml,
    avgEnergy,
    symptomDays,
    mealsLogged,
  }
}

/**
 * Send email report via EmailJS
 */
async function sendEmailReport(toEmail, userName, frequency, reportData) {
  const emailjs = require('@emailjs/nodejs')
  
  const serviceId = process.env.EMAILJS_SERVICE_ID
  // Template IDs should be set in Netlify env vars (e.g., "Meno_ReportDaily")
  const templateMap = {
    daily: process.env.EMAILJS_TEMPLATE_REPORT_DAILY || 'Meno_ReportDaily',
    weekly: process.env.EMAILJS_TEMPLATE_REPORT_WEEKLY || 'Meno_ReportWeekly',
    monthly: process.env.EMAILJS_TEMPLATE_REPORT_MONTHLY || 'Meno_ReportMonthly',
  }
  const templateId = templateMap[frequency] || templateMap.weekly
  const publicKey = process.env.EMAILJS_PUBLIC_KEY

  if (!serviceId || !templateId || !publicKey) {
    throw new Error('EmailJS not configured')
  }

  // Variables match the {{variable}} names in the HTML templates
  const templateParams = {
    to_email: toEmail,
    to_name: userName,
    user_name: userName,
    report_period: reportData.period,
    report_data: reportData.html,
  }

  // Add additional variables for weekly/monthly reports
  if (frequency === 'weekly' && reportData.insight) {
    templateParams.insight_message = reportData.insight
  }
  if (frequency === 'monthly') {
    if (reportData.trends) templateParams.trends_message = reportData.trends
    if (reportData.recommendations) templateParams.recommendations_message = reportData.recommendations
  }

  await emailjs.send(
    serviceId,
    templateId,
    templateParams,
    { publicKey }
  )
}

/**
 * Send SMS report via Twilio
 */
async function sendSMSReport(toPhone, frequency, reportData) {
  const twilio = require('twilio')
  
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromPhone = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !fromPhone) {
    throw new Error('Twilio not configured')
  }

  const client = twilio(accountSid, authToken)

  const message = `MenoEase ${frequency} Report: Energy ${reportData.avgEnergy}/11, ${reportData.symptomDays} symptom days, ${reportData.mealsLogged} meals. View full report: your-app-url.netlify.app/insights`

  await client.messages.create({
    body: message,
    from: fromPhone,
    to: toPhone,
  })
}

