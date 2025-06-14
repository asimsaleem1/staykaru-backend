## Firebase Setup Final Steps

To complete the Firebase setup, follow these steps:

### 1. Generate a new service account key

1. Go to the [Firebase Console](https://console.firebase.google.com/project/staykaruapp/settings/serviceaccounts/adminsdk)
2. Select "Project settings" > "Service accounts"
3. Click "Generate new private key"
4. Save the JSON file as `service-account/staykaruapp-firebase-adminsdk.json` in your project directory

### 2. Enable Firebase Authentication

1. Go to the [Authentication section](https://console.firebase.google.com/project/staykaruapp/authentication)
2. Click "Get started" or "Set up sign-in method"
3. Enable "Email/Password" authentication
4. Optional: Enable other authentication methods as needed

### 3. Test Firebase Configuration

Make sure you have a test-firebase-config.ts script (if not, I can help you write one). Then run:

```bash
npx ts-node test-firebase-config.ts
```

This should print something like:

```
Successfully connected to Firebase.
```

### 4. Set Environment Variables in Heroku

You'll run these commands in your terminal (replace values if needed):

```bash
heroku config:set FIREBASE_PROJECT_ID="staykaruapp"

heroku config:set FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@staykaruapp.iam.gserviceaccount.com"

heroku config:set FIREBASE_API_KEY="AIzaSyCPHmMYcnhgqc8IuYio9tLYFPDsEcijavs"

heroku config:set FIREBASE_AUTH_DOMAIN="staykaruapp.firebaseapp.com"

# Add private key (make sure to have jq installed)
heroku config:set FIREBASE_PRIVATE_KEY="$(cat service-account/staykaruapp-firebase-adminsdk.json | jq -r '.private_key')"
```

If you're on Windows or having trouble with the last line, you can use this alternative approach:

1. Open the service account JSON file
2. Copy the private key value (including the BEGIN and END lines)
3. Replace actual newlines with `\n`
4. Set the environment variable manually:
   ```bash
   heroku config:set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key content here\n-----END PRIVATE KEY-----\n"
   ```

### 5. Run Migration Script

Once Firebase is ready and tested:

```bash
npx ts-node migration-script.ts
```

This will transfer user data from Supabase to Firebase Authentication.

### 6. Remove Supabase (Optional)

After successful migration:

1. Uninstall Supabase libraries:
   ```bash
   npm uninstall @supabase/supabase-js
   ```

2. Clean related .env entries:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY

3. Remove Supabase client code from your codebase:
   - src/config/supabase.config.ts
   - Any Supabase-specific authentication logic

### Need Help with Any of These?

If you encounter issues with:
- Writing test-firebase-config.ts
- The migration-script.ts is not available
- Heroku, Windows shell, or secrets management

Please reach out and I can provide additional guidance or generate any missing files.
