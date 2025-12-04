# How to Start the Development Server

## Step-by-Step Instructions

### 1. Open PowerShell or Command Prompt
- Press `Win + X` and select "Windows PowerShell" or "Terminal"
- Navigate to your project folder:
  ```powershell
  cd "C:\Users\Admin\Documents\5. MenoTrak"
  ```

### 2. Verify .env File Exists
```powershell
# Check if .env exists
dir .env
```

**If .env doesn't exist:**
1. Create a new file named `.env` in the project root
2. Add this content (replace with your actual Supabase values):
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_APP_URL=http://localhost:3000
   ```

### 3. Install Dependencies (if not done)
```powershell
npm install
```

Wait for it to finish (may take 1-2 minutes)

### 4. Start the Development Server
```powershell
npm run dev
```

**You should see output like:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 5. Open Your Browser
- The server should automatically open `http://localhost:3000`
- If not, manually go to: `http://localhost:3000`

## Troubleshooting

### If you see "command not found: npm"
- Node.js is not installed
- Download from: https://nodejs.org
- Install and restart your terminal

### If you see "Missing Supabase environment variables"
- Check your `.env` file exists
- Verify it has actual values (not "your_supabase_project_url")
- Restart the dev server after editing `.env`

### If port 3000 is already in use
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with the number from above)
taskkill /PID <PID> /F

# Or use a different port - edit vite.config.js
```

### If the server starts but browser shows ERR_CONNECTION_REFUSED
1. Make sure the terminal shows "Local: http://localhost:3000"
2. Try `http://127.0.0.1:3000` instead
3. Check Windows Firewall isn't blocking it
4. Try a different browser

### If you see module errors
```powershell
# Delete and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

## Quick Verification Checklist

- [ ] `.env` file exists in project root
- [ ] `.env` has real Supabase credentials (not placeholders)
- [ ] `node_modules` folder exists
- [ ] Running `npm run dev` shows "Local: http://localhost:3000"
- [ ] Browser can access `http://localhost:3000`

## Still Not Working?

1. **Check the terminal output** - What error message do you see?
2. **Check browser console** (F12) - Any errors there?
3. **Try a different port** - Edit `vite.config.js` and change port to 3001
4. **Restart your computer** - Sometimes helps with port/firewall issues




