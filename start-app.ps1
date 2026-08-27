Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Starting Ratnakara Marine Platform... " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$baseDir\backend`"; Write-Host '--- Backend Server (Port 3001) ---' -ForegroundColor Green; npm run dev"

Start-Sleep -Seconds 2

# Start Frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$baseDir\frontend`"; Write-Host '--- Frontend App (Port 3000) ---' -ForegroundColor Green; npm run dev"

Write-Host ""
Write-Host "✓ Backend starting on:  http://localhost:3001" -ForegroundColor Green
Write-Host "✓ Frontend starting on: http://localhost:3000" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
