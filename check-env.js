// Quick script to check if .env is set up correctly
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

try {
  const envContent = readFileSync(join(__dirname, '.env'), 'utf-8')
  
  const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL') && 
                         !envContent.includes('your_supabase_project_url')
  const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY') && 
                         !envContent.includes('your_supabase_anon_key')
  
  if (hasSupabaseUrl && hasSupabaseKey) {
    console.log('✅ .env file looks good!')
    process.exit(0)
  } else {
    console.log('❌ .env file needs to be configured')
    console.log('   Please add your actual Supabase credentials')
    process.exit(1)
  }
} catch (error) {
  console.log('❌ .env file not found!')
  console.log('   Please create .env file with your Supabase credentials')
  process.exit(1)
}




