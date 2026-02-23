# Deployment Guide

## Quick Summary

- **Backend**: Railway (auto-provisions PostgreSQL)
- **Frontend**: Vercel
- **Estimated time**: 10 minutes setup

---

## Step 1: Deploy Backend to Railway

### 1A. Initial Setup
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click **"New Project"** → **"Deploy from GitHub Repo"**
4. Select `prestonhuss42-commits/personal-finance` repository
5. Click **"Deploy Now"**

### 1B. Add PostgreSQL Database (Critical!)
1. In Railway dashboard, click **"+ New"** in the project
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will auto-provision the database
4. The `DATABASE_URL` will be automatically created as an environment variable

### 1C. Configure Environment Variables
Railway automatically creates `DATABASE_URL` from the PostgreSQL plugin. You only need to add:

1. In the **`finance-backend`** service settings (in Railway dashboard):
2. Go to **"Variables"** tab
3. Add these variables:
   - **Key**: `JWT_SECRET`  
     **Value**: Generate a random string, e.g., `your-random-secret-key-min-20-characters-long-12345`
   - **Key**: `DATABASE_PROVIDER`  
     **Value**: `postgresql`
   - **Key**: `NODE_ENV`  
     **Value**: `production`
   - **Key**: `PORT`  
     **Value**: `4000`

4. Click **"Deploy"** button to redeploy with new variables

### ✅ You'll see:
- Build succeeds
- `[DB] Database connection OK` in logs
- `[Server] Listening on port 4000` in logs

Copy your **Railway backend URL** (e.g., `https://your-project.railway.app`) for Step 2.

---

## Step 2: Deploy Frontend to Vercel

### 2A. Deploy
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"New Project"**
4. Select `personal-finance` repository
5. Framework: **Next.js**
6. Root Directory: **`./frontend`**
7. Click **"Deploy"**

### 2B. Add Environment Variable
1. After Vercel finishes initial deploy, go to **Settings** → **Environment Variables**
2. Add:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your Railway backend URL (from Step 1C)
   - Click **"Save"**

3. Go to **Deployments** → click the three dots on the latest deploy → **"Redeploy"**

### ✅ You'll get:
- Frontend URL: `https://your-project.vercel.app`
- Connected to your Railway backend

---

## Step 3: Test the Live App

1. Open your Vercel frontend URL
2. Test with demo account:
   - Email: `demo@example.com`
   - Password: `demo`
3. Try: add expense → filter → edit → delete → view charts

---

## Troubleshooting

### "Failed to get private network endpoint"
- ✅ Did you add PostgreSQL database to Railway? (Step 1B)
- ✅ Did you set `DATABASE_PROVIDER=postgresql`? (Step 1C)
- ✅ Did you click "Deploy" after adding env vars?
- Try: Go to Railway → click the "finance-backend" service → "Logs" tab and check for errors

### Frontend shows "API error"
- ✅ Check that `NEXT_PUBLIC_API_URL` in Vercel matches your Railway URL exactly
- ✅ Go to Vercel → Deployments → Redeploy the latest build

### Demo account doesn't work
- Likely the database hasn't seeded yet (takes ~1 min on first run)
- Try signing up with a new account instead

### "Cannot find module" errors on Railway
- The Procfile already handles this
- Just wait for Railway to rebuild (it does this automatically)

---

## Local Development (Optional)

```bash
# Backend
cd backend
npm install
npx prisma migrate dev --name init
node seed.js
npm run dev

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Demo account: `demo@example.com` / `demo`

