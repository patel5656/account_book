# Business Rules & Validation Guidelines

This document outlines the core system logic, role permissions, company lifecycle rules, and security policies for the **Os Books SaaS** backend.

> [!IMPORTANT]
> **Zero Mock Data Policy**: All calculations (discount math, P&L, stock changes, ledger balances, mergers) must run live against the MySQL database. Under no circumstances may any route or controller serve mock data.

---

## 1. Role Permissions & Access Control

The system enforces strict Role-Based Access Control (RBAC).

### 1.1 Superadmin Role
*   **Access**: Has full access to `/superadmin/*` routes.
*   **Capabilities**:
    *   Can view global metrics, MRR, and all companies.
    *   Can create, modify, suspend, or delete any company (Tenant).
    *   Can modify global SaaS subscription plans and pricing.
    *   Can **impersonate** any company to view their dashboard securely.
*   **Restriction**: Cannot perform accounting transactions directly unless actively impersonating a company.

### 1.2 Company Admin Role (Tenant Owner)
*   **Access**: Has full access to their specific `company_id` data.
*   **Capabilities**:
    *   Can manage their own subscription billing.
    *   Can create and manage Employee/Staff accounts for their company.
    *   Can configure print settings, GST details, and perform all accounting operations.
*   **Restriction**: Cannot view or modify data of other companies.

### 1.3 Staff Role (Cashier / Employee)
*   **Access**: Limited access to POS, billing, and inventory within their assigned company.
*   **Restriction**: Cannot alter company settings, delete bank accounts with balances, view full P&L reports, or manage subscriptions.

---

## 2. Company Lifecycle Rules

A company's status dictates its access to the platform.

*   **ACTIVE**: Full access. Subscriptions are paid and valid.
*   **TRIAL**: Full access for a limited time (e.g., 14 days). An alert badge is shown indicating remaining days.
*   **EXPIRED**: Read-only access. Users can view past invoices and reports but cannot create new transactions until the subscription is renewed.
*   **SUSPENDED**: Blocked entirely by the Superadmin (usually for TOS violations or severe billing failure). Users cannot log in.

---

## 3. Subscription Lifecycle Rules

*   **Upgrades**: When upgrading mid-cycle, the remaining balance of the current plan is prorated and applied to the new invoice.
*   **Downgrades**: When downgrading, the new plan takes effect at the *end* of the current billing cycle to prevent immediate feature loss.
*   **Renewals**: Invoices are generated automatically 3 days before expiry. If unpaid on the due date, a grace period of 7 days is provided before transitioning the company to `EXPIRED` status.

---

## 4. Impersonation Rules

*   **Mechanism**: A Superadmin requests an impersonation token for a target `companyId`.
*   **Security**: The generated JWT contains a special `impersonatorId` claim.
*   **Audit Trail**: Any action taken by the Superadmin while impersonating (e.g., deleting a faulty record) is explicitly logged in the audit logs as `"Action performed by Support (Superadmin)"` rather than the regular user, ensuring data integrity.

---

## 5. Security & Consistency Rules

*   **Data Isolation**: Every database query on tenant tables (invoices, products, customers, employees, vouchers, categories, logs) MUST include a `WHERE companyId = ?` clause or Prisma relation filter (`where: { companyId }`) enforced at the controller/service layer.
*   **JWT Only**: Authentication relies solely on JSON Web Tokens. Redis or session stores are strictly prohibited to maintain stateless horizontal scaling on Railway.
*   **Password Policies**: Minimum 8 characters. Stored securely using bcrypt with a generated salt.
*   **Session Timeout**: JWTs expire after 24 hours. Refresh tokens or re-login is required.
*   **Two-Factor Authentication (2FA)**: If enabled in Global Settings, high-risk actions (like deleting a company or merging banks) require a secondary OTP verification.
*   **Brute-Force Protection**: Limit login attempts to a maximum of 5 failures within 15 minutes. Upon breach, temporarily lock the user account status for 30 minutes.

---

## 6. Mathematical & Bookkeeping Consistency Rules

### 6.1 Double-Entry adjustments & Ledger Postings
*   **Ledger Balance Integration**: When a Credit Sales Invoice is created, the system must debit the corresponding Customer's account balance and credit the Sales revenue account.
*   **Voucher Creation**: Vouchers must balance. For Journal Vouchers, the sum of all debits must equal the sum of all credits.
*   **Deletions & Reversals**: If an invoice is deleted or modified, corresponding inventory stock levels must be restored, and customer/bank ledger balances must be reversed in a transaction block to maintain math integrity.

### 6.2 Stock & Inventory Rules
*   **Deduction Formula**: Upon saving a sales invoice or checkout item, the product's stock is adjusted:
    $$\text{stock}_{\text{new}} = \text{stock}_{\text{current}} - (\text{quantity}_{\text{sold}} + \text{quantity}_{\text{free}})$$
*   **Negative Stock Policy**: If negative stock is disabled in settings, the system must block invoice saving if the quantity sold exceeds available stock.

### 6.3 Discount Stacking Rules (Dual Discount)
*   **Sequential Application**: Row discount percentage values ($D_1$ and $D_2$) must be computed sequentially.
    $$\text{Amount}_{\text{after } D_1} = \text{Base Amount} \times \left(1 - \frac{D_1}{100}\right)$$
    $$\text{Final Row Amount} = \text{Amount}_{\text{after } D_1} \times \left(1 - \frac{D_2}{100}\right)$$
*   **Calculations Order**: No discount values are added together (i.e. $D_1 + D_2$ is never used as a combined percentage).

### 6.4 BOM (Bill of Materials) Rules
*   **Stock Consumption**: Manufacturing a finish product via BOM must automatically consume component items from stock according to the BOM formula. If component stock is insufficient, the manufacturing log must fail.

### 6.5 Profit & Loss (P&L) and Trading Accounts
*   **Real-time Computations**: P&L and Trading accounts must derive metrics directly from invoices, voucher ledgers, operating expenses, and incomes, without any hardcoded mock averages.
*   **Formula**:
    $$\text{Gross Profit} = \text{Sales Revenue} - \text{Cost of Goods Sold (COGS)}$$
    $$\text{Net Profit} = \text{Gross Profit} + \text{Other Income} - \text{Total Expenses}$$

