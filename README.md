# Personal Finance Dashboard

Full-stack personal finance dashboard with authentication, expense CRUD, filtering, summaries, and chart visualization.

## Demo

<video src="./assets/demo.mp4" controls width="900"></video>

[Download demo video](./assets/demo.mp4)

## Project Type
- Local development project (no live hosting required)
- Clone and run on your machine using the setup steps below

## Tech Stack
- Backend: Node.js, Express, Prisma, SQLite (local)
- Frontend: Next.js, React, Axios, Chart.js

Quick start (development):

1. Backend

```bash
cd backend
npm install
# create local env file (one time)
cp .env.example .env
# run migrations and seed demo data
npx prisma migrate dev --name init
node seed.js
npm run dev
```

On Windows PowerShell, use this once instead of `cp`:

```powershell
Copy-Item .env.example .env
```

Demo account: **demo@example.com / demo**

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Windows PowerShell (execution policy safe):

```powershell
cd backend
npm.cmd install
Copy-Item .env.example .env
npx.cmd prisma migrate dev --name init
node seed.js
npm.cmd run dev

# in a second terminal
cd frontend
npm.cmd install
npm.cmd run dev
```

> **Windows PowerShell users:** if you see an error about scripts being disabled (`npm.ps1 cannot be loaded`), either run PowerShell as admin and execute `Set-ExecutionPolicy RemoteSigned` or start the servers directly with Node:
>
> ```powershell
> cd backend && node src/index.js
> cd frontend && node node_modules\next\dist\bin\next dev
> ```

Environment variables:
- Backend: copy `backend/.env.example` to `backend/.env`
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
- API requests are routed through a Next.js proxy endpoint.
- This repository is intended for local execution and code review.
