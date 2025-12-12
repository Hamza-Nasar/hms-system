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

### 5. GOOGLE_CLIENT_SECRET (Optional - Agar Google OAuth use karna hai)
- **Kya hai:** Google OAuth Client Secret
- **Kaise milega:** Google Cloud Console se

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

