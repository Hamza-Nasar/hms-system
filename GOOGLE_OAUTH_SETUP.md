# Google OAuth Setup Guide

## Step 1: Google Cloud Console Setup

### 1.1 Create a Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter project name (e.g., "HMS System")
5. Click **"Create"**

### 1.2 Enable Google+ API
1. Go to **APIs & Services** → **Library**
2. Search for **"Google+ API"** or **"Google Identity"**
3. Click on it and click **"Enable"**

### 1.3 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**
4. If prompted, configure OAuth consent screen first:
   - **User Type**: External (for public use) or Internal (for Google Workspace)
   - **App name**: Your app name (e.g., "HMS System")
   - **User support email**: Your email
   - **Developer contact information**: Your email
   - Click **"Save and Continue"**
   - Add scopes (if needed): `email`, `profile`, `openid`
   - Click **"Save and Continue"**
   - Add test users (if needed)
   - Click **"Save and Continue"**
   - Review and click **"Back to Dashboard"**

5. Now create OAuth Client ID:
   - **Application type**: Web application
   - **Name**: HMS System (or any name)
   - **Authorized JavaScript origins**:
     - For local development: `http://localhost:3000`
     - For Vercel: `https://your-app-name.vercel.app`
   - **Authorized redirect URIs**:
     - For local development: `http://localhost:3000/api/auth/callback/google`
     - For Vercel: `https://your-app-name.vercel.app/api/auth/callback/google`
   - Click **"Create"**

6. **Copy the credentials**:
   - **Client ID** (this is your `GOOGLE_CLIENT_ID`)
   - **Client Secret** (this is your `GOOGLE_CLIENT_SECRET`)

## Step 2: Add to Vercel

### 2.1 Add Environment Variables
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

   **GOOGLE_CLIENT_ID**
   - Key: `GOOGLE_CLIENT_ID`
   - Value: Paste the Client ID from Google Cloud Console
   - Environment: Select all (Production, Preview, Development)

   **GOOGLE_CLIENT_SECRET**
   - Key: `GOOGLE_CLIENT_SECRET`
   - Value: Paste the Client Secret from Google Cloud Console
   - Environment: Select all (Production, Preview, Development)

5. Click **"Save"** for each variable

### 2.2 Redeploy
1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**

## Step 3: Verify Setup

1. Go to your login page
2. You should see **"Continue with Google"** button
3. Click it and test the OAuth flow

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Check that the redirect URI in Google Cloud Console matches exactly:
  - Format: `https://your-domain.com/api/auth/callback/google`
  - No trailing slashes
  - Must be HTTPS for production

### Error: "invalid_client"
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Make sure they're set in Vercel environment variables
- Redeploy after adding variables

### Button not showing
- Check browser console for errors
- Verify environment variables are set
- Check NextAuth configuration

## Important Notes

- **Never commit** `GOOGLE_CLIENT_SECRET` to Git
- Keep credentials secure
- Use different OAuth clients for development and production (optional but recommended)
- Google OAuth requires HTTPS in production (Vercel provides this automatically)

## Quick Reference

**Where to find credentials:**
- Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs

**Required Environment Variables:**
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your Vercel URL (e.g., `https://your-app.vercel.app`)

**Redirect URI Format:**
- `https://your-domain.com/api/auth/callback/google`

