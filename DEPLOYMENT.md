# Deployment Guide

Your project is now ready for production deployment! Follow these steps to deploy the backend to Railway and frontend to Vercel.

## Step 1: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `personal-finance` repository
4. Railway will auto-detect it as a Node.js project
5. In the Railway dashboard, configure environment variables:
   - Go to the project settings
   - Add `DATABASE_URL` = `postgresql://[postgre-url-provided-by-railway]`
   - Add `JWT_SECRET` = (generate a random strong secret, e.g., `your-random-secret-here-min-32-chars`)
   - Add `PORT` = `4000`
6. Railway will automatically build and deploy
7. Once deployed, note the **backend URL** (e.g., `https://your-project.railway.app`)

## Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project" → Select your `personal-finance` repository
3. Select the `frontend` directory as the root
4. In Environment Variables, add:
   - `NEXT_PUBLIC_API_URL` = (your Railway backend URL from Step 1, e.g., `https://your-project.railway.app`)
5. Click "Deploy"
6. Once deployed, you'll get a **frontend URL** (e.g., `https://your-project.vercel.app`)

## Step 3: Test Your Live App

1. Open your Vercel frontend URL
2. Sign up with a new account or use test credentials
3. Create, edit, filter, and delete expenses
4. Verify the chart displays and summaries calculate correctly

## Environment Variables Summary

For local development:
- Backend: Already configured in `.env`
- Frontend: Already configured in `.env.local`

For production:
- Backend (Railway): Set via Railway dashboard
- Frontend (Vercel): Set via Vercel environment variables

## Demo Credentials

You can test with:
- Email: `demo@example.com`
- Password: `demo`

This account is seeded in the database when the backend starts.

## Troubleshooting

- **Railway build fails**: Ensure DATABASE_URL is set to a valid PostgreSQL connection string
- **Frontend can't reach backend**: Check that NEXT_PUBLIC_API_URL in Vercel matches your Railway backend URL
- **Login not working**: Verify JWT_SECRET is set consistently on Railway
- **Database empty**: Ensure seed.js runs automatically or run `npm run seed` manually on Railway

