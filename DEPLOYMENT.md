# Deployment Guide

Your project is now ready for production deployment! Follow these steps to deploy the backend to Railway and frontend to Vercel.

## Step 1: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `personal-finance` repository
4. Railway will auto-detect it as a Node.js project
5. **Important:** In the Railway dashboard project settings, add these environment variables:
   - `DATABASE_URL` = Use Railway's built-in PostgreSQL. Create a PostgreSQL database and copy the connection string, OR use SQLite with `file:./prisma/dev.db`
   - `JWT_SECRET` = Generate a random strong secret (min 20 chars, e.g., `your-random-secret-here-32-chars-min`)
   - `NODE_ENV` = `production`
   - `PORT` = `4000` (optional, defaults to 4000)

6. The build will automatically run `npm run build` (which generates Prisma client)
7. The server will start with `npm start`
8. Database migrations run automatically on first startup
9. Once deployed, note the **backend URL** (e.g., `https://your-project.railway.app`)

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

