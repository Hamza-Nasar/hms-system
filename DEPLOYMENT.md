# 🚀 Deployment Guide - HM System

Complete deployment guide for Hospital Management System.

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB database (local or MongoDB Atlas)
- Git repository
- Domain name (optional)

---

## 🌐 Option 1: Vercel Deployment (Recommended)

Vercel is the easiest and best option for Next.js applications.

### Step 1: Prepare Your Code

1. **Push to GitHub/GitLab/Bitbucket:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create `.env.example` file** (already created)
3. **Test build locally:**
   ```bash
   npm run build
   ```

### Step 2: Deploy to Vercel

1. **Sign up/Login to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub/GitLab/Bitbucket

2. **Import Project:**
   - Click "Add New Project"
   - Import your repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.example`:
     ```
     DATABASE_URL=your-mongodb-connection-string
     NEXTAUTH_SECRET=your-secret-key
     NEXTAUTH_URL=https://your-app.vercel.app
     GOOGLE_CLIENT_ID=your-google-client-id
     GOOGLE_CLIENT_SECRET=your-google-client-secret
     OPENAI_API_KEY=your-openai-key (optional)
     ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-app.vercel.app`

### Step 3: Update OAuth Callbacks

After deployment, update OAuth redirect URIs:
- **Google OAuth:** Add `https://your-app.vercel.app/api/auth/callback/google`
- Update `NEXTAUTH_URL` in Vercel environment variables

### Step 4: MongoDB Atlas Setup

1. **Create MongoDB Atlas Account:**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create free cluster

2. **Get Connection String:**
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Add to Vercel environment variables as `DATABASE_URL`

3. **Network Access:**
   - Add `0.0.0.0/0` to allow all IPs (or Vercel IPs)

---

## 🚂 Option 2: Railway Deployment

Railway is great for full-stack apps with databases.

### Step 1: Setup

1. **Sign up at [railway.app](https://railway.app)**
2. **Create New Project**
3. **Deploy from GitHub**

### Step 2: Configure

1. **Add MongoDB Service:**
   - Click "New" → "Database" → "MongoDB"
   - Railway will create MongoDB instance

2. **Add Environment Variables:**
   - Go to Variables tab
   - Add all required variables

3. **Deploy:**
   - Railway auto-detects Next.js
   - Builds and deploys automatically

---

## 🐳 Option 3: Docker Deployment

### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Step 2: Update next.config.ts

Add output: 'standalone' to next.config.ts:

```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  // ... rest of config
};
```

### Step 3: Build and Run

```bash
docker build -t hms-system .
docker run -p 3000:3000 --env-file .env hms-system
```

---

## ☁️ Option 4: AWS/DigitalOcean

### AWS (EC2/Elastic Beanstalk)

1. **Create EC2 Instance:**
   - Ubuntu 22.04 LTS
   - t2.micro (free tier)

2. **Setup:**
   ```bash
   # SSH into instance
   sudo apt update
   sudo apt install nodejs npm nginx -y
   
   # Clone repository
   git clone your-repo-url
   cd hms-system
   npm install
   npm run build
   
   # Install PM2
   sudo npm install -g pm2
   pm2 start npm --name "hms-system" -- start
   pm2 save
   pm2 startup
   ```

3. **Configure Nginx:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### DigitalOcean App Platform

1. **Create App:**
   - Connect GitHub repository
   - Auto-detects Next.js

2. **Add Database:**
   - Add MongoDB managed database
   - Connection string auto-injected

3. **Environment Variables:**
   - Add all required variables
   - Deploy

---

## 🔧 Environment Variables Checklist

Before deploying, ensure these are set:

### Required:
- ✅ `DATABASE_URL` - MongoDB connection string
- ✅ `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- ✅ `NEXTAUTH_URL` - Your production URL

### Optional:
- `GOOGLE_CLIENT_ID` - For Google OAuth
- `GOOGLE_CLIENT_SECRET` - For Google OAuth
- `OPENAI_API_KEY` - For AI Assistant
- `STRIPE_SECRET_KEY` - For payments
- `TWILIO_ACCOUNT_SID` - For SMS

---

## 🧪 Pre-Deployment Checklist

- [ ] Test build locally: `npm run build`
- [ ] All environment variables documented
- [ ] MongoDB connection tested
- [ ] OAuth callbacks updated
- [ ] Security headers configured
- [ ] Error handling tested
- [ ] Database migrations ready
- [ ] SSL certificate configured (if custom domain)

---

## 📝 Post-Deployment Steps

1. **Verify Deployment:**
   - Visit your production URL
   - Test login/register
   - Check API endpoints

2. **Monitor:**
   - Check Vercel/Railway logs
   - Monitor MongoDB Atlas
   - Set up error tracking (Sentry optional)

3. **Update DNS (if custom domain):**
   - Add CNAME record pointing to Vercel
   - Wait for DNS propagation

4. **Test Features:**
   - User registration
   - Password reset
   - OAuth login
   - All dashboard features

---

## 🆘 Troubleshooting

### Build Fails:
- Check Node.js version (18+)
- Verify all dependencies installed
- Check for TypeScript errors

### Database Connection Issues:
- Verify MongoDB connection string
- Check network access (IP whitelist)
- Test connection string locally

### OAuth Not Working:
- Verify callback URLs
- Check environment variables
- Ensure OAuth credentials are correct

### 500 Errors:
- Check server logs
- Verify environment variables
- Test database connection

---

## 🔒 Security Best Practices

1. **Never commit `.env` file**
2. **Use strong `NEXTAUTH_SECRET`**
3. **Enable MongoDB authentication**
4. **Use HTTPS (automatic on Vercel)**
5. **Regular security updates**
6. **Monitor for vulnerabilities**

---

## 📞 Support

For deployment issues:
1. Check deployment logs
2. Verify environment variables
3. Test locally first
4. Check MongoDB connection

---

## 🎉 Success!

Once deployed, your HM System will be live and accessible worldwide!

**Recommended:** Start with Vercel for easiest deployment experience.

