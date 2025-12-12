# Vercel Deployment Guide

## Required Environment Variables

Agar aap Vercel par deploy kar rahe hain, to yeh environment variables **zaroor** set karein:

### 1. NEXTAUTH_SECRET (Required)
- **Kya hai:** NextAuth ke liye secret key
- **Kaise generate karein:**
  ```bash
  openssl rand -base64 32
  ```
  Ya online generator use karein: https://generate-secret.vercel.app/32
- **Example:** `aBc123XyZ456DeF789GhI012JkL345MnO678PqR901StU234VwX567YzA890`

### 2. NEXTAUTH_URL (Required)
- **Kya hai:** Production URL
- **Value:** Apni Vercel deployment URL
- **Example:** `https://your-app-name.vercel.app`
- **Note:** Vercel automatically set kar sakta hai, lekin manually bhi set kar sakte hain

### 3. DATABASE_URL (Required)
- **Kya hai:** MongoDB connection string
- **Format:** 
  - MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/hms-system`
  - Local MongoDB: `mongodb://localhost:27017/hms-system`
- **Example:** `mongodb+srv://admin:password123@cluster0.xxxxx.mongodb.net/hms-system?retryWrites=true&w=majority`

### 4. GOOGLE_CLIENT_ID (Optional - Agar Google OAuth use karna hai)
- **Kya hai:** Google OAuth Client ID
- **Kaise milega:** Google Cloud Console se
- **Detailed Guide:** See `GOOGLE_OAUTH_SETUP.md` file
- **Quick Steps:**
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Create a project (or use existing)
  3. Enable Google+ API
  4. Go to APIs & Services → Credentials
  5. Create OAuth 2.0 Client ID (Web application)
  6. Add authorized redirect URI: `https://your-app.vercel.app/api/auth/callback/google`
  7. Copy Client ID and Client Secret

### 5. GOOGLE_CLIENT_SECRET (Optional - Agar Google OAuth use karna hai)
- **Kya hai:** Google OAuth Client Secret
- **Kaise milega:** Google Cloud Console se (same place as Client ID)
- **Detailed Guide:** See `GOOGLE_OAUTH_SETUP.md` file

## Vercel mein Environment Variables kaise add karein:

1. **Vercel Dashboard** kholen: https://vercel.com/dashboard
2. Apna **project** select karein
3. **Settings** tab par jayein
4. **Environment Variables** section mein jayein
5. Har variable ke liye:
   - **Key** enter karein (e.g., `NEXTAUTH_SECRET`)
   - **Value** enter karein
   - **Environment** select karein (Production, Preview, Development - sab select karein)
   - **Add** button click karein

6. **Redeploy** karein:
   - **Deployments** tab par jayein
   - Latest deployment ke saamne **"..."** menu click karein
   - **Redeploy** select karein

## Quick Setup - Vercel mein Environment Variables add karein:

**Important:** Actual values `.env.local` file mein hain (jo Git mein commit nahi hoti). Vercel mein manually add karein:

### 1. NEXTAUTH_SECRET
- Value: `.env.local` file se copy karein
- Generate karne ke liye: `openssl rand -base64 32`

### 2. NEXTAUTH_URL
**Important:** Apni actual Vercel URL use karein (localhost nahi!)
- Production: `https://your-app-name.vercel.app`
- Local development: `http://localhost:3000`

### 3. DATABASE_URL
- Value: `.env.local` file se copy karein
- Format: `mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority&appName=Cluster0`
- **Note:** Database name check karein - agar `hms-system` use karna hai to change karein

### 4. GOOGLE_CLIENT_ID
- Value: `.env.local` file se copy karein
- Ya Google Cloud Console se generate karein

### 5. GOOGLE_CLIENT_SECRET
- Value: `.env.local` file se copy karein
- Ya Google Cloud Console se generate karein

**Important Notes:** 
- `NEXTAUTH_URL` ko apni actual Vercel URL se replace karein (localhost nahi!)
- Google OAuth ke liye redirect URI bhi update karein Google Cloud Console mein:
  - `https://your-app-name.vercel.app/api/auth/callback/google`
- `DATABASE_URL` mein database name check karein - agar `hms-system` use karna hai to change karein

## Important Notes:

- Environment variables add karne ke **baad redeploy zaroori hai**
- Production, Preview, aur Development - **teeno environments** mein variables add karein
- `NEXTAUTH_SECRET` ko **kabhi bhi commit mat karein** - sirf environment variables mein rakhein
- `DATABASE_URL` mein **password** ko properly encode karein (special characters ke liye)

## Troubleshooting:

### "Configuration" Error:
- Check karein ki `NEXTAUTH_SECRET` set hai
- Check karein ki `NEXTAUTH_URL` set hai aur correct format mein hai
- Redeploy karein after adding variables

### Database Connection Error:
- Check karein ki `DATABASE_URL` correct format mein hai
- MongoDB Atlas ho to network access allow karein
- Replica set properly configured ho

### Google OAuth Not Working:
- Check karein ki `GOOGLE_CLIENT_ID` aur `GOOGLE_CLIENT_SECRET` set hain
- Google Cloud Console mein authorized redirect URIs check karein
- `NEXTAUTH_URL` properly set ho

