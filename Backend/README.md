# HealthCart API

Node.js + **Express** + **Sequelize** (MySQL). No Prisma.

## Stack

- **Express** — HTTP API
- **Sequelize** — ORM (models in `src/models/`, connection in `src/orm/sequelize.js`)
- **mysql2** — MySQL driver (used by Sequelize)
- **SQL migrations** — table definitions in `sql/tables/` (not ORM sync)

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` (MySQL).
2. Create schema and seed data:

```bash
npm run db:setup
```

3. Run the API:

```bash
npm run dev
```

## Database

- **Apply schema:** `npm run db:schema` — runs `sql/apply-schema.js` (drops & recreates tables from `sql/tables/*.sql`)
- **Seed:** `npm run db:seed`

Services use parameterized SQL via Sequelize (`query`, `queryOne`, `execute` in `src/config/database.js`). Use `models` from the same module for ORM-style access where you add it.
