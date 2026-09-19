# HealthCart

Healthcare, laboratory tests, appointments and membership platform.

## Stack

- Frontend: React + Vite + TypeScript + Tailwind + Redux Toolkit + TanStack Query
- Backend: NestJS + Prisma + MySQL + JWT

## Run locally

### 1. Database

```bash
cd Backend
docker compose up -d
```

### 2. API

```bash
cd Backend
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

API: http://localhost:5000/api  
Swagger: http://localhost:5000/api/docs

### 3. Web app

```bash
cd Frontend
npm install
npm run dev
```

App: http://localhost:5173 (or the next free port Vite prints)

MySQL is expected locally (XAMPP root with empty password is configured in `Backend/.env`). Docker Compose is also included if you prefer a container.

## Demo accounts

- User: `mayur@healthcart.com` / `Demo@1234`
- Admin: `admin@healthcart.com` / `Admin@1234`

Open `/splash` for the branded intro, then sign in and complete the booking and membership journeys.
