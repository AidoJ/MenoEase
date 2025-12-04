# Troubleshooting Guide

## ERR_CONNECTION_REFUSED on localhost:3000

### Issue: Dev server not running or crashed

**Solution 1: Check if .env file exists**
```bash
# Check if .env exists
ls .env

# If not, create it:
# Copy env.example to .env and add your Supabase credentials
```

**Solution 2: Start dev server manually**
```bash
npm run dev
```

**Solution 3: Use the startup script**
```powershell
powershell -ExecutionPolicy Bypass -File start-dev.ps1
```

**Solution 4: Check for errors**
- Look at the terminal output when running `npm run dev`
- Common errors:
  - Missing .env file
  - Invalid Supabase credentials
  - Port 3000 already in use
  - Missing dependencies

### Issue: Port 3000 already in use

**Solution:**
```bash
# Option 1: Kill process on port 3000
netstat -ano | findstr :3000
# Note the PID, then:
taskkill /PID <PID> /F

# Option 2: Use different port
# Edit vite.config.js and change port to 3001
```

### Issue: Missing Supabase environment variables

**Error message:** "Missing Supabase environment variables"

**Solution:**
1. Create `.env` file in project root
2. Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Restart dev server

### Issue: App loads but authentication doesn't work

**Check:**
1. Supabase credentials are correct in `.env`
2. Supabase project is active
3. Database schema has been run
4. Authentication is enabled in Supabase
5. Redirect URLs are configured in Supabase

### Issue: Dependencies not installed

**Solution:**
```bash
npm install
```

### Issue: Module not found errors

**Solution:**
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Quick Diagnostic Commands

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Check if .env exists
ls .env

# Check if dependencies installed
ls node_modules

# Check what's running on port 3000
netstat -ano | findstr :3000

# Check for Node processes
Get-Process -Name node
```

## Common Error Messages

### "Cannot find module '@supabase/supabase-js'"
- Run: `npm install`

### "Missing Supabase environment variables"
- Create `.env` file with your credentials

### "EADDRINUSE: address already in use :::3000"
- Port 3000 is in use, kill the process or change port

### "Failed to fetch" or network errors
- Check Supabase URL and key are correct
- Check internet connection
- Verify Supabase project is active

## Still Having Issues?

1. Check browser console (F12) for errors
2. Check terminal output for errors
3. Verify `.env` file has correct values
4. Try clearing browser cache
5. Restart dev server




