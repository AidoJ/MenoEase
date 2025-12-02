# Push all changes to GitHub
Write-Host "Checking git status..." -ForegroundColor Cyan
git status

Write-Host "`nAdding all changes..." -ForegroundColor Cyan
git add -A

Write-Host "`nChecking what will be committed..." -ForegroundColor Cyan
git status --short

Write-Host "`nCommitting changes..." -ForegroundColor Cyan
git commit -m "Complete all frontend features with full database integration - Sleep, Symptoms, Food, Medications, Exercise, Mood, Journal, Dashboard"

Write-Host "`nPushing to GitHub..." -ForegroundColor Cyan
git push origin main

Write-Host "`n✅ Done! Check GitHub to verify." -ForegroundColor Green
