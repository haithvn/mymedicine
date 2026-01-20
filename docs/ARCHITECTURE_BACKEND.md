# Backend Architecture - My Medicine

## Overview

Backend được xây dựng trên **Next.js 15** sử dụng App Router, kết nối với **PostgreSQL** qua **Drizzle ORM**.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 | API Routes + Server-side |
| Drizzle ORM | Database ORM |
| PostgreSQL | Database (Neon serverless) |
| Zod | Schema validation |
| TypeScript | Type safety |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     API Layer (Next.js)                     │
│                   /api/[resource]/route.ts                  │
├─────────────────────────────────────────────────────────────┤
│                    Validation Layer (Zod)                   │
│                  Schema validation for input                │
├─────────────────────────────────────────────────────────────┤
│                    Database Layer (Drizzle)                 │
│                    db.select() / db.insert()                │
├─────────────────────────────────────────────────────────────┤
│                    PostgreSQL (Neon)                        │
│               users, medicines, diseases,                   │
│            prescriptions, prescription_medicines            │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
backend/
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── medicines/
│   │       │   ├── route.ts         # GET all, POST new
│   │       │   └── [id]/route.ts    # GET one, PATCH, DELETE
│   │       ├── diseases/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── prescriptions/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       └── reminders/
│   │           └── today/route.ts
│   ├── drizzle/
│   │   ├── schema.ts      # Database schema definitions
│   │   └── migrations/    # SQL migrations
│   └── lib/
│       └── db.ts          # Database connection
├── drizzle.config.ts
└── package.json
```

## Database Schema

```sql
-- Users
users (id, name, email, created_at)

-- Medicines
medicines (id, name, manufacturer, active_ingredients, quantity, unit, status)

-- Diseases
diseases (id, name, description, created_at)

-- Prescriptions
prescriptions (id, disease_id, frequency, scheduled_times[], created_at)

-- Prescription Medicines (Junction)
prescription_medicines (id, prescription_id, medicine_id, dosage)
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/medicines` | List all medicines |
| POST | `/api/medicines` | Create medicine |
| PATCH | `/api/medicines/[id]` | Update medicine |
| DELETE | `/api/medicines/[id]` | Delete medicine |
| GET | `/api/diseases` | List all diseases |
| POST | `/api/diseases` | Create disease |
| PATCH | `/api/diseases/[id]` | Update disease |
| DELETE | `/api/diseases/[id]` | Delete disease |
| GET | `/api/prescriptions` | List all prescriptions |
| POST | `/api/prescriptions` | Create prescription |
| DELETE | `/api/prescriptions/[id]` | Delete prescription |
| GET | `/api/reminders/today` | Get today's reminders |

## Key Features

1. **Cascade Delete**: Deleting a disease removes all related prescriptions
2. **Zod Validation**: All input validated before database operations
3. **Type Safety**: Full TypeScript with Drizzle's type inference
4. **Serverless Ready**: Designed for Vercel/Neon deployment

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@host/db
```

## Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Build for production
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```
