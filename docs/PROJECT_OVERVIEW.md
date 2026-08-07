# Project Overview & Context

This document provides system-level context, business background, runtime assumptions, and onboarding guidelines for developers working on the **Os Books SaaS** codebase.

> [!IMPORTANT]
> **Zero Mock Data Policy**: All features, dashboard metrics, ledger balances, reports, and master records are fully database-driven. No mock data, hard-coded objects, or local storage bypasses are permitted. All data must be fetched and saved using the Prisma ORM database layer connected to MySQL.

---

## 1. Core Background & Domain Context

**Os Books** operates in the SMB (Small & Medium Business) billing and accounting domain. It is transitioning from an offline-first browser system into a full **Multi-Tenant SaaS Platform**.

*   **Superadmin SaaS Architecture**: A multi-tenant system managed by a Superadmin, allowing different retail companies (tenants) to subscribe, manage their own shops, and handle billing securely.
*   **Double-Entry Bookkeeping Principles**: Every transaction modifies a ledger balance. Adjusting item quantities sold reduces product stock while simultaneously modifying party ledgers and updating active cash/bank books.
*   **Dual Discount Structure (D1 and D2)**: Retail accounting uses compound discount rows. Rather than applying a single combined percentage, the system runs Discount 1, updates the taxable balance, and then applies Discount 2 sequentially to calculate final tax parameters.

---

## 2. Full SaaS System Overview

The Os Books system consists of several core modules built for the Superadmin and Tenant users:

1.  **Dashboard Analytics**: Tracks system health, Monthly Recurring Revenue (MRR), total active companies, and subscriptions.
2.  **Company Management (Tenant System)**: Allows the Superadmin to onboard, manage, suspend, and **impersonate** companies to provide seamless support.
3.  **Tenant Onboarding Flow**: Secure creation of new tenant environments with default configurations.
4.  **Subscription & Billing**: Management of tiered pricing plans (Basic, Pro, Enterprise), payment gateways, and recurring invoices.
5.  **Global Settings**: Superadmin configurations including security (2FA, session timeouts), alerts, and global announcements.
6.  **Core Accounting (Tenant View)**: Features like sales invoices, thermal POS printing, ledger management, and inventory catalogs that each company uses locally.

---

## 3. Local Development Setup (Prisma + MySQL)

The backend is built with **Node.js, Express, Prisma ORM, and MySQL**.

### 3.1 Prerequisites
*   Node.js (v18+)
*   MySQL Server (Local instance)

### 3.2 Local Setup
1.  **Environment Variables**:
    Create a `.env` file in the root with the following mandatory variables:
    ```env
    PORT=3000
    DATABASE_URL="mysql://root:password@localhost:3306/account_db"
    JWT_SECRET="your_super_secret_jwt_key"
    ```
    *Note: There is NO environment-specific branching logic. The application strictly reads from these standard variables.*

2.  **Database Initialization**:
    Generate the Prisma client and push the schema to the local MySQL instance:
    ```bash
    npm install
    npx prisma generate
    npx prisma db push
    ```

3.  **Run the Server**:
    ```bash
    npm run dev
    ```

---

## 4. Railway Deployment Flow

The system is fully designed to be deployed to Railway without **any code changes**. The exact same application and Prisma schema used locally will run in production.

1.  **Provision MySQL on Railway**: Add a MySQL database instance in your Railway project.
2.  **Environment Variables**: Set the exact same variables in the Railway project settings:
    *   `PORT` (Provided automatically by Railway)
    *   `DATABASE_URL` (Use Railway's MySQL connection string)
    *   `JWT_SECRET` (Secure production key)
3.  **Deploy**: Connect the GitHub repository or use Railway CLI. Railway will automatically run `npm install`, `npx prisma generate`, and start the Node.js server.
4.  **No Code Alteration**: Because Prisma relies strictly on `DATABASE_URL` and Express relies on `process.env.PORT`, the application seamlessly transitions from local MySQL to Railway MySQL. No local SQLite database or fallback generator is used.

---

## 5. System Modules (Superadmin & Tenant)

The completed React frontend communicates with the backend across the following domain modules:

### 5.1 Superadmin SaaS Modules
*   **Dashboard**: High-level system KPI analytics (Active companies, MRR, subscriptions, billing history).
*   **Company Management**: Onboarding new tenants, activating/suspending company entries.
*   **Add Tenant**: Direct provisioning of fresh environments with baseline settings.
*   **Subscriptions**: Configuration of subscription pricing plans and invoice logs.
*   **Global Settings**: Global announcement banners, system security settings (2FA requirements, session timeouts).

### 5.2 Tenant Accounting SaaS Modules (Company Admin Dashboard focus)
*   **Company Master & Settings**: Management of print templates, company settings, and store contexts.
*   **Bank Master**: Ledger bank accounts, cash registers, and the Account Ledger Merger flow.
*   **Customer Master & Supplier Master**: Credit outstanding logs, ledger balances, and transactions.
*   **Employee Master**: Attendance logs, sales summaries, and role assignments (Staff vs Admin).
*   **Income Master**: Other non-sales income streams, source tracking.
*   **Expenses Master & Ledger**: Operating expenses, category mapping.
*   **Payment Book & Cash/Bank Summary**: Daybooks, collection reports, cash flow summaries.
*   **Advanced Item Master (Product Catalog)**: SKUs, units of measure, barcode lookup, category catalogs, and stock details.
*   **Unit Master**: Unit Catalog Management (e.g. PCS, BOX, KGS).
*   **Offer Management**: Dynamic product discounts and price tiering.
*   **Stock Details & Inventory**: Stock adjustments, transfer details, purchase entries, and sales invoice deductions.
*   **BOM Master (Bill of Materials)**: Manufacturing formulas for compound items.
*   **Voucher Master**: Non-sales/journal vouchers and payment vouchers.
*   **Category Master**: Hierarchical product and expense categories.

