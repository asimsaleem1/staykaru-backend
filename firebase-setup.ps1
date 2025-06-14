# Firebase Setup Script for Windows PowerShell
# Run this script to set up the required Firebase environment variables

Write-Host "Firebase Authentication Setup Script"
Write-Host "==================================="
Write-Host ""
Write-Host "This script will help you set up the required Firebase environment variables."
Write-Host "You need to have created a Firebase project and generated a service account key."
Write-Host ""

# Check if .env file exists
if (Test-Path -Path ".env") {
    Write-Host "Found existing .env file."
    $append_env = Read-Host "Would you like to append to it? (y/n)"
    if ($append_env -ne "y") {
        Write-Host "Please back up your .env file and run this script again."
        exit 1
    }
} else {
    Write-Host "Creating new .env file..."
    New-Item -Path ".env" -ItemType File | Out-Null
}

Write-Host ""
Write-Host "Please enter your Firebase project details:"
Write-Host ""

# Project ID
$project_id = Read-Host "Firebase Project ID"
Add-Content -Path ".env" -Value "FIREBASE_PROJECT_ID=$project_id"

# Client Email
$client_email = Read-Host "Firebase Client Email (from service account key)"
Add-Content -Path ".env" -Value "FIREBASE_CLIENT_EMAIL=$client_email"

# Private Key
Write-Host "Firebase Private Key (from service account key):"
Write-Host "Note: Copy your private key from the service account JSON file."
Write-Host "Make sure to include the BEGIN and END lines."
$private_key = Read-Host "Paste the private key (replace actual line breaks with \n)"
Add-Content -Path ".env" -Value "FIREBASE_PRIVATE_KEY=`"$private_key`""

# API Key
$api_key = Read-Host "Firebase Web API Key (from Firebase console)"
Add-Content -Path ".env" -Value "FIREBASE_API_KEY=$api_key"

# Auth Domain
$auth_domain = Read-Host "Firebase Auth Domain (usually your-project-id.firebaseapp.com)"
Add-Content -Path ".env" -Value "FIREBASE_AUTH_DOMAIN=$auth_domain"

Write-Host ""
Write-Host "Environment variables have been added to .env file."
Write-Host "To set these variables in Heroku, run the following commands:"
Write-Host ""
Write-Host "heroku config:set FIREBASE_PROJECT_ID=`"$project_id`""
Write-Host "heroku config:set FIREBASE_CLIENT_EMAIL=`"$client_email`""
Write-Host "heroku config:set FIREBASE_API_KEY=`"$api_key`""
Write-Host "heroku config:set FIREBASE_AUTH_DOMAIN=`"$auth_domain`""
Write-Host ""
Write-Host "For the private key, you need to preserve line breaks when setting in Heroku."
Write-Host "If you have the service account JSON file, you can use jq to extract it correctly."
Write-Host ""
Write-Host "Setup complete! You can now test your Firebase configuration with:"
Write-Host "npx ts-node test-firebase-config.ts"
