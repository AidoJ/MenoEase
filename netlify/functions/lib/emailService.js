/**
 * Centralized Email Service for MenoEase
 * Handles all email communications via EmailJS
 */

const emailjs = require('@emailjs/nodejs')

// EmailJS Template IDs
const TEMPLATES = {
  REMINDER: 'Meno_Reminder',
  WELCOME: 'Meno_Welcome',
  UPGRADE: 'Meno_Upgrade',
  DOWNGRADE: 'Meno_Downgrade',
  CANCELLED: 'Meno_Cancelled',
  REPORT_DAILY: 'test_report', // Temporary - testing if fresh template works
  REPORT_WEEKLY: 'Meno_ReportWeekly',
  REPORT_MONTHLY: 'Meno_ReportMonthly',
}

/**
 * Base function to send email via EmailJS
 */
async function sendEmail(templateId, params) {
  const serviceId = process.env.EMAILJS_SERVICE_ID
  const publicKey = process.env.EMAILJS_PUBLIC_KEY
  const privateKey = process.env.EMAILJS_PRIVATE_KEY

  console.log('EmailJS configuration check:', {
    hasServiceId: !!serviceId,
    hasPublicKey: !!publicKey,
    hasPrivateKey: !!privateKey,
    privateKeyLength: privateKey ? privateKey.length : 0,
  })

  if (!serviceId || !publicKey) {
    throw new Error('EmailJS not configured. Missing EMAILJS_SERVICE_ID or EMAILJS_PUBLIC_KEY')
  }

  if (!privateKey) {
    console.warn('WARNING: EMAILJS_PRIVATE_KEY is not set. Server-side calls may fail.')
  }

  try {
    const options = {
      publicKey: publicKey,
    }

    // Only add private key if it exists
    if (privateKey) {
      options.privateKey = privateKey
    }

    console.log('Sending email with options:', {
      templateId,
      templateIdType: typeof templateId,
      templateIdLength: templateId?.length,
      hasPrivateKey: !!options.privateKey,
      serviceId: serviceId.substring(0, 8) + '...',
      paramKeys: Object.keys(params),
    })

    console.log('EXACT TEMPLATE ID:', JSON.stringify(templateId))

    const response = await emailjs.send(
      serviceId,
      templateId,
      params,
      options
    )
    console.log(`Email sent successfully: ${templateId}`, response)
    return response
  } catch (error) {
    console.error(`Error sending email with template ${templateId}:`, error)
    throw error
  }
}

/**
 * Send reminder email
 */
async function sendReminderEmail(toEmail, userName, message, reminderType) {
  const now = new Date()
  const date = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return sendEmail(TEMPLATES.REMINDER, {
    to_email: toEmail,
    to_name: userName,
    user_name: userName,
    reminder_type: reminderType,
    reminder_message: message,
    message: message,
    date,
    time,
  })
}

/**
 * Send welcome email to new user
 */
async function sendWelcomeEmail(toEmail, userName) {
  return sendEmail(TEMPLATES.WELCOME, {
    to_email: toEmail,
    to_name: userName,
    user_name: userName,
  })
}

/**
 * Send subscription upgrade email
 */
async function sendUpgradeEmail(toEmail, userName, tierName) {
  return sendEmail(TEMPLATES.UPGRADE, {
    to_email: toEmail,
    to_name: userName,
    user_name: userName,
    tier_name: tierName,
  })
}

/**
 * Send subscription downgrade email
 */
async function sendDowngradeEmail(toEmail, userName, tierName) {
  return sendEmail(TEMPLATES.DOWNGRADE, {
    to_email: toEmail,
    to_name: userName,
    user_name: userName,
    tier_name: tierName,
  })
}

/**
 * Send subscription cancellation email
 */
async function sendCancellationEmail(toEmail, userName, endDate) {
  return sendEmail(TEMPLATES.CANCELLED, {
    to_email: toEmail,
    to_name: userName,
    user_name: userName,
    end_date: endDate,
  })
}

/**
 * Send daily report email
 */
async function sendDailyReportEmail(toEmail, userName, date, reportData) {
  return sendEmail(TEMPLATES.REPORT_DAILY, {
    to_email: toEmail,
    to_name: userName,
    user_name: userName,
    date: date,
    report_data: reportData,
  })
}

/**
 * Send weekly report email
 */
async function sendWeeklyReportEmail(toEmail, userName, reportPeriod, reportData, insightMessage) {
  return sendEmail(TEMPLATES.REPORT_WEEKLY, {
    to_email: toEmail,
    to_name: userName,
    user_name: userName,
    report_period: reportPeriod,
    report_data: reportData,
    insight_message: insightMessage || '',
  })
}

/**
 * Send monthly report email
 */
async function sendMonthlyReportEmail(toEmail, userName, reportPeriod, reportData, trendsMessage, recommendationsMessage) {
  return sendEmail(TEMPLATES.REPORT_MONTHLY, {
    to_email: toEmail,
    to_name: userName,
    user_name: userName,
    report_period: reportPeriod,
    report_data: reportData,
    trends_message: trendsMessage || '',
    recommendations_message: recommendationsMessage || '',
  })
}

module.exports = {
  TEMPLATES,
  sendEmail,
  sendReminderEmail,
  sendWelcomeEmail,
  sendUpgradeEmail,
  sendDowngradeEmail,
  sendCancellationEmail,
  sendDailyReportEmail,
  sendWeeklyReportEmail,
  sendMonthlyReportEmail,
}
