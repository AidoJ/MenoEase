# Start development server with environment check
Write-Host "Checking environment setup..." -ForegroundColor Yellow

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host ""
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Creating .env from template..." -ForegroundColor Yellow
    
    # Create .env from env.example if it exists
    if (Test-Path env.example) {
        Copy-Item env.example .env
        Write-Host "✓ .env file created" -ForegroundColor Green
    } else {
        # Create basic .env
        @"
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
VITE_APP_URL=http://localhost:3000
"@ | Out-File -FilePath .env -Encoding utf8
        Write-Host "✓ .env file created" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit .env and add your Supabase credentials!" -ForegroundColor Yellow
    Write-Host "   Get them from: Supabase Dashboard → Settings → API" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press any key to continue (server will start but won't work until .env is configured)..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Check if .env has placeholder values
$envContent = Get-Content .env -Raw -ErrorAction SilentlyContinue
if ($envContent -and ($envContent -match 'your_supabase' -or $envContent -match 'your_')) {
    Write-Host ""
    Write-Host "⚠️  WARNING: .env file contains placeholder values!" -ForegroundColor Yellow
    Write-Host "   Please replace with your actual Supabase credentials" -ForegroundColor Yellow
    Write-Host ""
}

# Check if node_modules exists
if (-not (Test-Path node_modules)) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Green
Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

npm run dev




