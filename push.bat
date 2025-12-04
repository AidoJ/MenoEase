@echo off
echo ========================================
echo Pushing all changes to GitHub
echo ========================================
echo.

echo Checking git status...
git status
echo.

echo Adding all files...
git add -A
echo.

echo Committing changes...
git commit -m "Complete all frontend features with full database integration"
echo.

echo Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo Done! Check your GitHub repo.
echo ========================================
pause



