# Quick Start Script for AI-Sentinel

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI-Sentinel Installation Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Installing Backend Dependencies..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\backend"
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Backend installation failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Installing Frontend Dependencies..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\frontend"
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend installation failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Installation Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Read SETUP.md for configuration instructions"
Write-Host "2. Set up MongoDB Atlas, Google OAuth, and Gemini API"
Write-Host "3. Create .env files in backend and frontend folders"
Write-Host "4. Run 'npm run dev' in backend folder"
Write-Host "5. Run 'npm run dev' in frontend folder (in new terminal)"
Write-Host ""
Write-Host "Need help? Check SETUP.md for detailed instructions!" -ForegroundColor Cyan
