# Deployment Guide: GitHub and Heroku

This guide provides step-by-step instructions for deploying your StayKaru backend application to GitHub and Heroku.

## GitHub Deployment

### 1. Initialize Git Repository (if not already done)

```bash
# Navigate to your project directory
cd d:\FYP\staykaru-backend

# Initialize Git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit of StayKaru backend"
```

### 2. Create GitHub Repository

1. Go to [GitHub](https://github.com/) and log in to your account
2. Click on the "+" icon in the top-right corner and select "New repository"
3. Enter a repository name (e.g., "staykaru-backend")
4. Add an optional description
5. Choose whether to make the repository public or private
6. Do NOT initialize the repository with a README, .gitignore, or license (since you're pushing an existing repository)
7. Click "Create repository"

### 3. Connect Local Repository to GitHub

```bash
# Add the GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/staykaru-backend.git

# Push your code to GitHub
git push -u origin main
# If your default branch is 'master' use:
# git push -u origin master
```

### 4. Configure GitHub Repository Settings

1. Go to your repository on GitHub
2. Click on "Settings" > "Branches"
3. Set up branch protection rules for your main branch if needed
4. Configure collaborators in "Settings" > "Manage access" if you're working with a team

## Heroku Deployment

### 1. Prerequisites

- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed
- Heroku account created at [heroku.com](https://www.heroku.com/)

### 2. Prepare Your Application for Heroku

#### Update package.json

Ensure your package.json has the correct start script and engines section:

```json
{
  "scripts": {
    "start": "node dist/main.js",
    "postinstall": "npm run build"
  },
  "engines": {
    "node": "16.x"
  }
}
```

#### Create a Procfile

Create a file named `Procfile` (no extension) in your project root:

```
web: npm start
```

#### Configure Environment Variables

Your application should use environment variables for configuration. Ensure you have:

```typescript
// In app.module.ts or configuration files
const mongoUri = process.env.MONGODB_URI || 'your_local_mongodb_uri';
const port = process.env.PORT || 3000;
```

### 3. Login to Heroku CLI

```bash
heroku login
```

### 4. Create a Heroku App

```bash
# Create a new Heroku app
heroku create staykaru-backend

# Or if you want Heroku to generate a random app name:
# heroku create
```

### 5. Configure Environment Variables on Heroku

```bash
# Set MongoDB connection string
heroku config:set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Set JWT secret
heroku config:set JWT_SECRET=your_jwt_secret

# Set other environment variables as needed
heroku config:set NODE_ENV=production
heroku config:set ENCRYPTION_KEY=your_encryption_key
```

### 6. Deploy to Heroku

```bash
# Push your code to Heroku
git push heroku main
# Or if your branch is 'master':
# git push heroku master
```

### 7. Ensure Proper Scaling

```bash
# Ensure at least one instance is running
heroku ps:scale web=1
```

### 8. Open Your Deployed Application

```bash
heroku open
```

### 9. Monitor Your Application

```bash
# View logs
heroku logs --tail

# Check app status
heroku ps
```

## Setting Up Continuous Deployment

### 1. Connect GitHub to Heroku

1. Go to [Heroku Dashboard](https://dashboard.heroku.com/) and select your app
2. Go to the "Deploy" tab
3. Under "Deployment method", select "GitHub"
4. Connect to your GitHub repository
5. Choose the branch you want to deploy from
6. Enable "Automatic deploys" if you want to deploy automatically when you push to the selected branch

### 2. Configure GitHub Actions for CI/CD (Optional)

Create a file at `.github/workflows/main.yml`:

```yaml
name: Node.js CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16.x]

    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v2
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    - run: npm ci
    - run: npm run build --if-present
    - run: npm test

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    
    steps:
    - uses: actions/checkout@v2
    - uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
        heroku_app_name: "staykaru-backend"
        heroku_email: ${{ secrets.HEROKU_EMAIL }}
```

For this to work, you'll need to add the following secrets to your GitHub repository:
- `HEROKU_API_KEY`: Your Heroku API key (found in your Heroku account settings)
- `HEROKU_EMAIL`: The email associated with your Heroku account

## Database Migration and Seeding (Optional)

If you need to migrate your database schema or seed initial data:

### 1. Create Migration Scripts

Create migration scripts in a `/migrations` folder:

```javascript
// migrations/01_create_initial_admin.js
const bcrypt = require('bcrypt');

async function up(db) {
  const adminExists = await db.collection('users').findOne({ role: 'admin' });
  
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    await db.collection('users').insertOne({
      name: 'Admin User',
      email: 'admin@staykaru.com',
      password: hashedPassword,
      role: 'admin',
      phone: '1234567890',
      countryCode: '+1',
      gender: 'other',
      isActive: true,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Admin user created successfully');
  }
}

module.exports = { up };
```

### 2. Create a Migration Runner

```javascript
// migrationRunner.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

const migrations = [
  require('./migrations/01_create_initial_admin')
];

async function runMigrations() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    const db = client.db();
    
    for (const migration of migrations) {
      console.log(`Running migration: ${migration.name}`);
      await migration.up(db);
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
  } finally {
    await client.close();
  }
}

runMigrations();
```

### 3. Run Migrations on Heroku

```bash
# Run locally first to test
node migrationRunner.js

# Run on Heroku
heroku run node migrationRunner.js
```

## Troubleshooting Common Deployment Issues

### Application Crashes

Check logs for errors:
```bash
heroku logs --tail
```

### Database Connection Issues

Verify your connection string:
```bash
heroku config:get MONGODB_URI
```

Ensure your MongoDB Atlas (or other provider) IP whitelist includes Heroku's IPs or is set to allow connections from anywhere (0.0.0.0/0).

### Memory Issues

If your app crashes due to memory limits, you may need to upgrade your Heroku dyno:
```bash
heroku ps:resize web=standard-1x
```

### Port Binding Issues

Make sure your application listens on the port provided by Heroku:
```typescript
const port = process.env.PORT || 3000;
app.listen(port);
```

### CORS Issues

Ensure your CORS configuration allows requests from your frontend domain:
```typescript
app.enableCors({
  origin: [
    'https://your-frontend-domain.com',
    'http://localhost:3000' // For local development
  ],
  credentials: true
});
```

## Monitoring and Maintenance

### Setting Up Monitoring

1. Add Heroku Application Metrics:
```bash
heroku addons:create librato
```

2. Add Logging:
```bash
heroku addons:create papertrail
```

### Regular Maintenance Tasks

1. Update dependencies regularly:
```bash
npm outdated
npm update
```

2. Check for security vulnerabilities:
```bash
npm audit
npm audit fix
```

3. Backup your database regularly:
```bash
# If using MongoDB Atlas, enable automated backups in your cluster settings
```

4. Monitor application performance and logs:
```bash
heroku addons:open librato
heroku addons:open papertrail
```

## Conclusion

Your StayKaru backend is now deployed to GitHub and Heroku with proper CI/CD configuration. Remember to:

1. Keep your environment variables secure
2. Regularly update dependencies
3. Monitor application performance
4. Back up your database
5. Test thoroughly before deploying to production

For any issues, refer to the Heroku documentation or contact their support.
