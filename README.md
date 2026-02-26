# Personal Finance Dashboard

Full-stack personal finance dashboard with authentication, expense CRUD, filtering, summaries, and chart visualization.

## Live Demo
- Frontend: https://personal-finance-one-tau.vercel.app
- Backend API: https://personal-finance-e23w.onrender.com

**[Deployment Guide](./DEPLOYMENT.md)** for production deployment setup.

## Tech Stack
- Backend: Node.js, Express, Prisma, PostgreSQL
- Frontend: Next.js, React, Axios, Chart.js

Quick start (development):

1. Backend

```bash
cd backend
npm install
# generate prisma client and run migrations
npx prisma migrate dev --name init
# optionally seed demo user/data
node seed.js
npm run dev
```

   > demo account: **demo@example.com / demo**

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

> **Windows PowerShell users:** if you see an error about scripts being disabled (`npm.ps1 cannot be loaded`), either run PowerShell as admin and execute `Set-ExecutionPolicy RemoteSigned` or start the servers directly with Node:
>
> ```powershell
> cd backend && node src/index.js
> cd frontend && node node_modules\next\dist\bin\next dev
> ```

Environment variables:
- Backend: set `JWT_SECRET` and `DATABASE_URL`
- Frontend: set `NEXT_PUBLIC_API_URL` (if not using the built-in proxy default)

## Features
- Expense categories with dropdown when adding
- Edit and delete buttons for each item (via inline form instead of prompts)
- Add/edit form reuses same inputs with update/cancel logic
- Filters for date range and category with quick-clear
- Weekly and monthly summary totals that respect filters
- Total expense calculation displayed
- Styled layout with responsive container, colored category labels, and nicer buttons/inputs
- Edit/add form combined for better workflow
- Simple client-side validation and empty-state messaging
- Logout button and route guarding to redirect to login
- Chart now aggregates expenses by date (daily totals)
- Expense listing shows date, category badge, and improved list styling

## Notes
- API requests are routed through a Next.js proxy endpoint for improved deployment reliability.
- The backend auto-validates DB connectivity on startup and returns clear API errors for easier troubleshooting.
