# Local Development Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables

Edit the `.env` file and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to find these:**
- Go to your Supabase project dashboard
- Click **Settings** → **API**
- Copy **Project URL** → `VITE_SUPABASE_URL`
- Copy **anon public** key → `VITE_SUPABASE_ANON_KEY`

### 3. Start Development Server
```bash
npm run dev
```

The app will open at `http://localhost:3000`

## Using the Setup Script

You can also run the automated setup script:

```powershell
powershell -ExecutionPolicy Bypass -File setup-local.ps1
```

This will:
- Check Node.js and npm installation
- Install all dependencies
- Create `.env` file if it doesn't exist
- Provide next steps

## Verify Setup

1. **Check dependencies installed:**
   ```bash
   ls node_modules
   ```

2. **Check environment variables:**
   - Open `.env` file
   - Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

3. **Start dev server:**
   ```bash
   npm run dev
   ```

4. **Test authentication:**
   - Go to `http://localhost:3000`
   - Try signing up a test user
   - Check Supabase → Authentication → Users to verify

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure `.env` file exists in project root
- Verify variable names start with `VITE_`
- Restart dev server after changing `.env`

### "Cannot find module" errors
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

### Port 3000 already in use
- Change port in `vite.config.js` or kill the process using port 3000
- Or use: `npm run dev -- --port 3001`

### Supabase connection errors
- Verify your Supabase URL and key are correct
- Check Supabase project is active
- Verify database schema has been run

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Next Steps After Setup

1. ✅ Local dev environment ready
2. 🚀 Start implementing features:
   - Sleep Logging
   - Symptoms Tracker
   - Dashboard with real data
   - Food Logging

## File Structure

```
.
├── .env                 # Environment variables (create this)
├── src/                 # Source code
│   ├── components/      # React components
│   ├── pages/           # Page components
│   ├── config/          # Configuration files
│   ├── services/       # API services
│   └── utils/          # Utility functions
├── public/             # Static assets
└── package.json       # Dependencies
```

## Hot Reload

The dev server supports hot module replacement (HMR):
- Changes to files automatically refresh the browser
- No need to manually refresh
- Fast development experience

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (for testing responsive design)




