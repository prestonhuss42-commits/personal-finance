# Local Setup Guide

This repository is configured for local development only.

## Status

- No live hosting required
- No deployment steps required
- Clone/download and run locally

## 1) Backend Setup

```bash
cd backend
npm install
npx prisma migrate dev --name init
node seed.js
npm run dev
```

Backend default: `http://localhost:4000`

## 2) Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend default: `http://localhost:3000`

## 3) Environment Variables

Backend:
- `DATABASE_URL`
- `JWT_SECRET`

Frontend:
- `NEXT_PUBLIC_API_URL` (optional if using local proxy defaults)

## 4) Demo Login

- Email: `demo@example.com`
- Password: `demo`

## Troubleshooting

### npm scripts blocked in PowerShell
If you see an execution policy error for `npm.ps1`, run one of these:

```powershell
Set-ExecutionPolicy RemoteSigned
```

Or run Node commands directly:

```powershell
cd backend
node src/index.js

cd frontend
node node_modules\next\dist\bin\next dev
```

