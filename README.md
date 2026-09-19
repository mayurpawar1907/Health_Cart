# HealthCart

Healthcare, laboratory tests, appointments and membership platform.

## Stack

- Frontend: React + Vite + JavaScript + Tailwind + Redux Toolkit + TanStack Query
- Backend: Node.js + Express (ESM, functional) + MySQL + JWT

Folder layout mirrors the GetGRC project (`backend/` + `frontend/`).

## Folder structure

```
HealthCare/
  backend/
    src/
      app.js              # Express app
      server.js           # process entry
      config/             # env + database pool
      constants/
      controllers/        # reserved (GetGRC-aligned)
      helper/
      middleware/
      routes/             # auth.js, users.js, …
      services/
      scripts/
      utils/
    sql/
      tables/             # one .sql file per table
      apply-schema.js
      seed.js
  frontend/
    src/
      api/                # axios client
      assets/
      components/
      config/
      constants/
      hooks/
      pages/              # route pages (was screens)
      routes/             # guards / route helpers
      store/
        slices/
      utils/
      App.jsx
      main.jsx
```

## Run locally

### 1. Database

```bash
cd backend
docker compose up -d
# or use local XAMPP/MySQL
```

### 2. API

```bash
cd backend
npm install
cp .env.example .env   # if needed
npm run db:schema      # only for empty MySQL
# optional: npm run db:seed   # demo users only — does NOT overwrite your catalog
npm run dev
```

API: http://localhost:5000/api

### 3. Web app

```bash
cd frontend
npm install
cp .env.example .env   # if needed
npm run dev
```

App: http://localhost:5173

Frontend env (`frontend/.env`):

- `VITE_API_BASE_URL=/api` — axios base URL
- `VITE_API_PROXY_TARGET=http://localhost:5000` — Vite proxy to Express

## Demo accounts

- User: `mayur@healthcart.com` / `Demo@1234`
- Admin: `admin@healthcart.com` / `Admin@1234`
- Super admin: `superadmin@healthidcard.com` / `Super@1234`
