/**
 * Netlify Function: Send Email via EmailJS
 *
 * Environment Variables Required:
 * - EMAILJS_SERVICE_ID
 * - EMAILJS_PUBLIC_KEY
 *
 * Template ID should be passed in the request body as 'template_id'
 */

const emailjs = require('@emailjs/nodejs')

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
      to_email,
      to_name,
      template_id,
      template_params,
    } = JSON.parse(event.body)

    // Validate required fields
    if (!to_email || !template_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: to_email, template_id' }),
      }
    }

    // Get EmailJS credentials from environment
    const serviceId = process.env.EMAILJS_SERVICE_ID
    const publicKey = process.env.EMAILJS_PUBLIC_KEY

    if (!serviceId || !publicKey) {
      console.error('Missing EmailJS environment variables')
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Email service not configured' }),
      }
    }

    // Prepare template parameters
    const params = {
      to_email,
      to_name: to_name || 'User',
      ...template_params,
    }

    // Send email via EmailJS
    const response = await emailjs.send(
      serviceId,
      template_id,
      params,
      {
        publicKey,
      }
    )

    console.log('Email sent successfully:', response)

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        response,
      }),
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to send email',
        message: error.message,
      }),
    }
  }
}






