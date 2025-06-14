# Heroku Deployment Checklist

## ✅ Files Ready
- [x] Updated GitHub Actions workflow (heroku-deploy.yml)
- [x] Procfile configured
- [x] package.json with correct start:prod script
- [x] main.ts configured to use PORT environment variable
- [x] Dockerfile created (for future use)

## 🔧 GitHub Secrets to Configure

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these repository secrets:

1. **HEROKU_API_KEY**
   - Go to Heroku Dashboard → Account Settings → API Key
   - Copy the API key and paste it here

2. **HEROKU_APP_NAME**
   - Your Heroku app name (e.g., "staykaru-backend" or whatever you named it)

3. **HEROKU_EMAIL**
   - The email address associated with your Heroku account

## 🚀 Deployment Steps

1. **Create Heroku App** (if not already created):
   ```bash
   heroku create your-app-name
   ```

2. **Set Environment Variables on Heroku**:
   ```bash
   heroku config:set NODE_ENV=production -a your-app-name
   heroku config:set MONGODB_URI=your-mongodb-connection-string -a your-app-name
   # Add other environment variables as needed
   ```

3. **Commit and Push to GitHub**:
   ```bash
   git add .
   git commit -m "Fix Heroku deployment configuration"
   git push origin main
   ```

4. **Monitor Deployment**:
   - Go to your GitHub repository → Actions tab
   - Watch the deployment process
   - Check Heroku logs if needed: `heroku logs --tail -a your-app-name`

## 🔍 Troubleshooting

If deployment fails:
1. Check GitHub Actions logs
2. Check Heroku logs: `heroku logs --tail -a your-app-name`
3. Verify all secrets are set correctly
4. Ensure MongoDB connection string is correct for production

## 📝 Environment Variables Needed

Make sure these are set in Heroku:
- NODE_ENV=production
- MONGODB_URI=your-production-mongodb-uri
- Any Firebase configuration variables
- JWT secrets
- Other API keys your app uses
