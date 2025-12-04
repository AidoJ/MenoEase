# MenoTrak Local Development Setup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MenoTrak Local Development Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
Write-Host "Checking npm installation..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($npmVersion) {
    Write-Host "✓ npm $npmVersion found" -ForegroundColor Green
} else {
    Write-Host "✗ npm not found" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Check if .env exists
Write-Host ""
if (Test-Path .env) {
    Write-Host "✓ .env file exists" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Make sure you've added your Supabase credentials to .env:" -ForegroundColor Yellow
    Write-Host "  - VITE_SUPABASE_URL" -ForegroundColor Cyan
    Write-Host "  - VITE_SUPABASE_ANON_KEY" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "✗ .env file not found" -ForegroundColor Red
    Write-Host "Creating .env from env.example..." -ForegroundColor Yellow
    Copy-Item env.example .env
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Edit .env and add your Supabase credentials:" -ForegroundColor Yellow
    Write-Host "  - VITE_SUPABASE_URL (from Supabase Dashboard > Settings > API)" -ForegroundColor Cyan
    Write-Host "  - VITE_SUPABASE_ANON_KEY (from Supabase Dashboard > Settings > API)" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env and add your Supabase credentials" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host ""




