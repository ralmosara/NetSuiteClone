# NetSuite Clone - Enterprise ERP System

A comprehensive, scalable ERP system built with Next.js 16, PostgreSQL, and modern web technologies.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL 16 (Docker)
- **ORM:** Prisma
- **Authentication:** NextAuth.js v5
- **API:** tRPC (end-to-end type safety)
- **UI:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand + TanStack Query
- **Real-time:** Socket.io (planned)

## Prerequisites

- Node.js 20+
- Docker Desktop
- npm or yarn

## Quick Start

### 1. Start Docker Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL 16 on port 5432
- Redis on port 6379
- MinIO (S3-compatible storage) on ports 9000/9001

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Test Credentials

After running the seed script:

- **Email:** admin@company.com
- **Password:** admin123

## Project Structure

```
erp-system/
├── docker/                  # Docker configuration
├── prisma/
│   ├── schema.prisma       # Database schema (50+ models)
│   └── seed.ts             # Database seed script
├── src/
│   ├── app/
│   │   ├── (auth)/         # Auth pages (login, etc.)
│   │   ├── (dashboard)/    # Protected dashboard pages
│   │   └── api/            # API routes (tRPC, NextAuth)
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   └── layout/         # Layout components (Header, Breadcrumb)
│   ├── lib/                # Utility functions
│   │   ├── auth.ts         # NextAuth configuration
│   │   ├── prisma.ts       # Prisma client
│   │   └── trpc.ts         # tRPC client
│   ├── server/
│   │   ├── trpc.ts         # tRPC initialization
│   │   └── routers/        # tRPC routers for each module
│   └── types/              # TypeScript types
├── docker-compose.yml
└── package.json
```

## Modules

### Core
- Dashboard with KPIs and quick actions
- Global search (Cmd+K)
- User authentication with role-based access
- Audit logging

### Sales
- Customers & Contacts
- Sales Orders
- Quotes
- Invoices
- Payments

### Purchasing
- Vendors
- Purchase Orders
- Item Receipts
- Vendor Bills

### Inventory
- Items (Inventory, Non-inventory, Service, Kit)
- Warehouses & Locations
- Stock Levels
- Inventory Transactions

### Manufacturing
- Bill of Materials (BOM)
- Work Orders
- QC Inspections

### Finance
- Chart of Accounts
- Journal Entries
- Fixed Assets & Depreciation
- Multi-currency support
- Intercompany Transfers

### Payroll/HR
- Employee Directory
- Departments
- Time Off Requests
- Payslips
- Benefits

### Reports
- Balance Sheet
- Income Statement
- Cash Flow Statement
- AR/AP Aging
- Sales by Customer/Item

### Setup
- Users & Roles
- Permissions
- Custom Fields
- Audit Log
- Subsidiaries

## Available Scripts

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL="postgresql://erp_user:erp_password@localhost:5432/erp_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
REDIS_URL="redis://localhost:6379"
```

## Design System

The UI matches the NetSuite design:
- **Primary Color:** #135bec
- **Font:** Manrope
- **Icons:** Material Symbols Outlined
- **Background:** #f6f6f8 (light) / #101622 (dark)

## License

Private - All rights reserved
