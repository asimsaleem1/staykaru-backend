# Firebase Setup Script
# Run this script to set up the required Firebase environment variables

echo "Firebase Authentication Setup Script"
echo "==================================="
echo ""
echo "This script will help you set up the required Firebase environment variables."
echo "You need to have created a Firebase project and generated a service account key."
echo ""

# Check if .env file exists
if [ -f .env ]; then
    echo "Found existing .env file."
    echo "Would you like to append to it? (y/n)"
    read append_env
    if [ "$append_env" != "y" ]; then
        echo "Please back up your .env file and run this script again."
        exit 1
    fi
else
    echo "Creating new .env file..."
    touch .env
fi

echo ""
echo "Please enter your Firebase project details:"
echo ""

# Project ID
echo "Firebase Project ID:"
read project_id
echo "FIREBASE_PROJECT_ID=$project_id" >> .env

# Client Email
echo "Firebase Client Email (from service account key):"
read client_email
echo "FIREBASE_CLIENT_EMAIL=$client_email" >> .env

# Private Key
echo "Firebase Private Key (from service account key, including BEGIN and END markers):"
echo "Note: Paste the entire key including line breaks, then press Enter followed by Ctrl+D"
private_key=$(cat)
echo "FIREBASE_PRIVATE_KEY=\"$private_key\"" >> .env

# API Key
echo "Firebase Web API Key (from Firebase console):"
read api_key
echo "FIREBASE_API_KEY=$api_key" >> .env

# Auth Domain
echo "Firebase Auth Domain (usually your-project-id.firebaseapp.com):"
read auth_domain
echo "FIREBASE_AUTH_DOMAIN=$auth_domain" >> .env

echo ""
echo "Environment variables have been added to .env file."
echo "To set these variables in Heroku, run the following commands:"
echo ""
echo "heroku config:set FIREBASE_PROJECT_ID=\"$project_id\""
echo "heroku config:set FIREBASE_CLIENT_EMAIL=\"$client_email\""
echo "heroku config:set FIREBASE_API_KEY=\"$api_key\""
echo "heroku config:set FIREBASE_AUTH_DOMAIN=\"$auth_domain\""
echo ""
echo "For the private key, you need to preserve line breaks when setting in Heroku."
echo "If you have the service account JSON file, you can use:"
echo "heroku config:set FIREBASE_PRIVATE_KEY=\"\$(cat path/to/service-account.json | jq -r '.private_key')\""
echo ""
echo "Setup complete! You can now test your Firebase configuration with:"
echo "npx ts-node test-firebase-config.ts"
