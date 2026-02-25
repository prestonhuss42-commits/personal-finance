# Personal Finance Dashboard

full-stack personal finance dashboard showing authentication, CRUD expenses, charts, and an API. 


**[📘 Deployment Guide →](./DEPLOYMENT.md)** For production deployment to Railway (backend) and Vercel (frontend).

Tech:
- Backend: Node.js, Express, Prisma (SQLite by default, PostgreSQL for production)
- Frontend: Next.js + React

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
- Backend: copy `backend/.env.example` to `.env` and set `JWT_SECRET` and `DATABASE_URL` (SQLite default included)

Notes:
- Swap SQLite for PostgreSQL by changing `DATABASE_URL` in `.env` and updating Prisma provider.
- This is a starter scaffold — extend roles, validations, UI, and tests as needed.

## Additional features added
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

Feel free to continue building filters, summaries, and better UI.d.
