/**
 * Netlify Function: Admin Reset Password
 *
 * Allows administrators to reset user passwords
 * Requires SUPABASE_SERVICE_ROLE_KEY for admin operations
 */

const { createClient } = require('@supabase/supabase-js')

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const { userId, newPassword } = JSON.parse(event.body)

    // Validate input
    if (!userId || !newPassword) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing userId or newPassword' }),
      }
    }

    if (newPassword.length < 6) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Password must be at least 6 characters' }),
      }
    }

    // Initialize Supabase with service role key (required for admin operations)
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Update user password using admin API
    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (error) {
      throw error
    }

    console.log(`Password reset successful for user ${userId}`)

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Password reset successfully',
      }),
    }
  } catch (error) {
    console.error('Error resetting password:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to reset password',
        message: error.message,
      }),
    }
  }
}
