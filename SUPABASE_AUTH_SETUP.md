# Supabase Auth Setup Guide

This guide will help you set up Supabase Authentication with Google Sign-In for DCrypto.

## Prerequisites

1. Supabase project created (already done: `ytgtszmtrknfjmqcziud`)
2. Google Cloud Console account

## Step 1: Get Supabase Credentials

1. Go to your Supabase project: https://supabase.com/dashboard/project/ytgtszmtrknfjmqcziud
2. Navigate to **Settings** → **API**
3. Copy the following:
   - **Project URL**: `https://ytgtszmtrknfjmqcziud.supabase.co`
   - **anon/public key**: (the `anon` key, not the `service_role` key)

## Step 2: Set Up Google OAuth

### 2.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click **Enable**

4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `DCrypto Web Client`
   - Authorized redirect URIs: 
     ```
     https://ytgtszmtrknfjmqcziud.supabase.co/auth/v1/callback
     ```
   - Click **Create**
   - Copy the **Client ID** and **Client Secret**

### 2.2 Configure Supabase

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click to enable it
3. Enter your Google OAuth credentials:
   - **Client IDs (for OAuth)**: Paste your Google Client ID
   - **Client Secret (for OAuth)**: Paste your Google Client Secret
4. **Callback URL** should already be set to:
   ```
   https://ytgtszmtrknfjmqcziud.supabase.co/auth/v1/callback
   ```
5. Click **Save**

## Step 3: Configure Frontend Environment

1. Create `.env` file in the `frontend` directory:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```env
   REACT_APP_SUPABASE_URL=https://ytgtszmtrknfjmqcziud.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
   REACT_APP_API_URL=http://127.0.0.1:8085/api
   ```

3. Replace `your_anon_key_here` with the actual anon key from Step 1

## Step 4: Test the Setup

1. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

2. Navigate to the login page
3. Click "Continue with Google"
4. You should be redirected to Google for authentication
5. After signing in, you'll be redirected back to the app

## Step 5: Enable Email/Password Auth (Optional)

If you want to use email/password authentication:

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **Email** and ensure it's enabled
3. Configure email templates if needed
4. Users can now sign up with email/password

## Troubleshooting

### Google Sign-In Not Working

1. **Check redirect URI**: Make sure the redirect URI in Google Cloud Console exactly matches:
   ```
   https://ytgtszmtrknfjmqcziud.supabase.co/auth/v1/callback
   ```

2. **Check Supabase settings**: Verify Google provider is enabled and credentials are correct

3. **Check browser console**: Look for errors in the browser console

### Environment Variables Not Loading

1. Make sure `.env` file is in the `frontend` directory
2. Restart the React development server after changing `.env`
3. Variable names must start with `REACT_APP_`

### Session Not Persisting

- Supabase automatically handles session persistence
- Check browser localStorage for `sb-*` keys (Supabase session keys)
- The app syncs Supabase session to `userId` in localStorage for backward compatibility

## How It Works

1. **Google Sign-In**: 
   - User clicks "Continue with Google"
   - Redirects to Google OAuth
   - Google redirects back to Supabase callback URL
   - Supabase creates/updates user session
   - App.js detects session and syncs to localStorage

2. **Email/Password Sign-In**:
   - User enters email/password
   - Supabase validates credentials
   - Creates session if valid
   - App.js syncs session to localStorage

3. **Session Management**:
   - Supabase handles token refresh automatically
   - App.js listens for auth state changes
   - Logout clears both Supabase session and localStorage

## Next Steps

- [ ] Test Google Sign-In
- [ ] Test Email/Password Sign-In
- [ ] Test logout functionality
- [ ] Verify transactions are linked to correct user ID
- [ ] Test on different browsers

## Security Notes

- Never commit `.env` file to git (already in `.gitignore`)
- The `anon` key is safe for frontend use (RLS policies protect data)
- Never expose the `service_role` key in frontend code
- Supabase RLS policies ensure users can only access their own data

