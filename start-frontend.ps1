# Start Frontend Server
Write-Host "Starting AI-Sentinel Frontend Server..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\frontend"

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "WARNING: .env file not found in frontend folder!" -ForegroundColor Red
    Write-Host "Please copy .env.example to .env and configure it." -ForegroundColor Yellow
    Write-Host "See SETUP.md for instructions." -ForegroundColor Yellow
    Read-Host "Press Enter to continue anyway or Ctrl+C to exit"
}

npm run dev
