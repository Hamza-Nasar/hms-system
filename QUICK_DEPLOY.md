# ⚡ Quick Deployment Guide

## 🚀 Vercel (5 Minutes) - Recommended

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your repository
5. Add Environment Variables:
   ```
   DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/hms-system
   NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
   NEXTAUTH_URL=https://your-app.vercel.app
   ```
6. Click "Deploy"
7. Done! 🎉

### Step 3: Setup MongoDB Atlas
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Add to Vercel environment variables
5. Add IP `0.0.0.0/0` to Network Access

### Step 4: Update OAuth (if using)
- Google OAuth: Add callback URL `https://your-app.vercel.app/api/auth/callback/google`
- Update `NEXTAUTH_URL` in Vercel

---

## 📋 Environment Variables Needed

Copy these to Vercel → Settings → Environment Variables:

```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/hms-system?retryWrites=true&w=majority
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-app.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id (optional)
GOOGLE_CLIENT_SECRET=your-google-client-secret (optional)
OPENAI_API_KEY=your-openai-key (optional)
```

---

## 🔑 Generate NEXTAUTH_SECRET

```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

---

## ✅ Pre-Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] `npm run build` works locally
- [ ] MongoDB Atlas cluster created
- [ ] Environment variables ready
- [ ] OAuth callbacks updated (if using)

---

## 🎯 That's It!

Your app will be live in 5 minutes on Vercel!

For detailed deployment options, see [DEPLOYMENT.md](./DEPLOYMENT.md)

