# Heroku Deployment Guide

This application is configured to be deployed to Heroku using GitHub Actions.

## Setting up GitHub Secrets

Before deploying, you need to set up the following secrets in your GitHub repository:

1. Go to your GitHub repository
2. Click on "Settings"
3. Click on "Secrets and variables" -> "Actions"
4. Add the following secrets:

- `HEROKU_API_KEY`: Your Heroku API key (find it in your Heroku account settings)
- `HEROKU_APP_NAME`: The name of your Heroku application
- `HEROKU_EMAIL`: The email address associated with your Heroku account

## Manual Deployment

If you prefer to deploy manually, follow these steps:

1. Install the Heroku CLI
2. Login to Heroku: `heroku login`
3. Create a new Heroku app: `heroku create your-app-name`
4. Add a git remote for Heroku: `heroku git:remote -a your-app-name`
5. Push to Heroku: `git push heroku main`

## Environment Variables

Make sure to set any required environment variables in your Heroku app settings.
