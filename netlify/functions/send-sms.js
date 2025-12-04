/**
 * Netlify Function: Send SMS via Twilio
 * 
 * Environment Variables Required:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_PHONE_NUMBER
 */

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const {
      to_phone,
      message,
    } = JSON.parse(event.body)

    // Validate required fields
    if (!to_phone || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: to_phone, message' }),
      }
    }

    // Get Twilio credentials from environment
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromPhone = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !fromPhone) {
      console.error('Missing Twilio environment variables')
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'SMS service not configured' }),
      }
    }

    // Import Twilio client (you'll need to add twilio to package.json)
    const twilio = require('twilio')
    const client = twilio(accountSid, authToken)

    // Send SMS
    const response = await client.messages.create({
      body: message,
      from: fromPhone,
      to: to_phone,
    })

    console.log('SMS sent successfully:', response.sid)

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'SMS sent successfully',
        sid: response.sid,
      }),
    }
  } catch (error) {
    console.error('Error sending SMS:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to send SMS',
        message: error.message,
      }),
    }
  }
}




