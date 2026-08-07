# API Contract & Specification

This document specifies the complete RESTful API contract for the **Os Books SaaS** backend. These APIs replace the former local storage mock layers and fully power the React frontend.

> [!IMPORTANT]
> **Zero Mock Data Policy**: Every API endpoint specified below must interact with live records stored in the MySQL database. Under no circumstances may any controller method return mock datasets, fake responses, or hard-coded configurations.

**Base URL**: `http://localhost:3000/api/v1` (Local) / `https://your-app.railway.app/api/v1` (Production)
**Authentication**: All protected endpoints require a Bearer token in the `Authorization` header (`Authorization: Bearer <JWT>`).

---

## 1. Authentication & Impersonation APIs

### 1.1 Login
*   **Method**: `POST`
*   **Endpoint**: `/auth/login`
*   **Auth Requirement**: None
*   **Request Body**:
    ```json
    { "email": "admin@osbooks.com", "password": "securepassword" }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "token": "eyJhbG...",
      "user": {
        "id": 1,
        "role": "SUPERADMIN",
        "companyId": null,
        "name": "Super Admin"
      }
    }
    ```
*   **Error Handling**: `401 Unauthorized` (Invalid credentials).

### 1.2 Impersonate Tenant (Superadmin Only)
*   **Method**: `POST`
*   **Endpoint**: `/auth/impersonate`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `SUPERADMIN`
*   **Request Body**:
    ```json
    { "companyId": 12 }
    ```
*   **Response (200 OK)**: Returns a new JWT scoped to the target company.
    ```json
    {
      "success": true,
      "token": "eyJhbG... (Impersonated Token)",
      "company": { "id": 12, "name": "Retail Corp" }
    }
    ```

---

## 2. Dashboard Analytics APIs

### 2.1 Superadmin KPI Dashboard
*   **Method**: `GET`
*   **Endpoint**: `/superadmin/dashboard/metrics`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `SUPERADMIN`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "totalCompanies": 145,
        "mrr": 52400.00,
        "activeSubscriptions": 120,
        "pendingTickets": 5
      }
    }
    ```

---

## 3. Company Management APIs

### 3.1 List All Companies
*   **Method**: `GET`
*   **Endpoint**: `/companies`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `SUPERADMIN`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        { "id": 1, "name": "Alpha Retail", "status": "ACTIVE", "plan": "PRO" }
      ]
    }
    ```

### 3.2 Create New Tenant (Company)
*   **Method**: `POST`
*   **Endpoint**: `/companies`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `SUPERADMIN`
*   **Request Body**:
    ```json
    {
      "name": "Beta Wholesale",
      "ownerEmail": "owner@beta.com",
      "ownerName": "John Beta",
      "planId": 2
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Company created successfully",
      "companyId": 2
    }
    ```

### 3.3 Suspend/Activate Company
*   **Method**: `PATCH`
*   **Endpoint**: `/companies/:id/status`
*   **Role Access**: `SUPERADMIN`
*   **Request Body**: `{ "status": "SUSPENDED" }`
*   **Response (200 OK)**: `{ "success": true, "message": "Status updated" }`

---

## 4. Subscription & Billing APIs

### 4.1 Get Subscription Plans
*   **Method**: `GET`
*   **Endpoint**: `/plans`
*   **Auth Requirement**: None (or JWT)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        { "id": 1, "name": "Basic", "price": 499.00, "features": ["POS", "Invoices"] }
      ]
    }
    ```

### 4.2 Update Company Subscription
*   **Method**: `POST`
*   **Endpoint**: `/subscriptions/upgrade`
*   **Role Access**: `COMPANY_ADMIN`, `SUPERADMIN`
*   **Request Body**:
    ```json
    { "companyId": 12, "planId": 3, "paymentReference": "pay_xyz" }
    ```
*   **Response (200 OK)**: `{ "success": true, "message": "Subscription updated" }`

---

## 5. Global Settings APIs

### 5.1 Get Global Settings
*   **Method**: `GET`
*   **Endpoint**: `/settings/global`
*   **Role Access**: `SUPERADMIN`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "sessionTimeoutMinutes": 120,
        "require2FA": false,
        "globalAnnouncement": "Scheduled maintenance at midnight."
      }
    }
    ```

### 5.2 Update Global Settings
*   **Method**: `PUT`
*   **Endpoint**: `/settings/global`
*   **Role Access**: `SUPERADMIN`
*   **Request Body**: `{ "globalAnnouncement": "Maintenance done." }`
*   **Response (200 OK)**: `{ "success": true, "message": "Settings updated" }`

---

## 6. Audit Log APIs

### 6.1 Create Audit Log
*   **Method**: `POST`
*   **Endpoint**: `/audit-logs`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `COMPANY_ADMIN`, `STAFF`
*   **Request Body**:
    ```json
    {
      "actionType": "CREATE_INVOICE",
      "details": "Invoice INV-100 created",
      "referenceId": "INV-100"
    }
    ```
*   **Response (201 Created)**: `{ "success": true }`

### 6.2 Get Audit Logs
*   **Method**: `GET`
*   **Endpoint**: `/audit-logs`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `SUPERADMIN`, `COMPANY_ADMIN`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        { "id": 1, "userName": "Staff 1", "actionType": "CREATE_INVOICE", "createdAt": "2026-06-19T10:00:00Z" }
      ]
    }
    ```

---

## 7. Tenant Accounting SaaS APIs

### 7.1 Company Master & Settings
*   **Method**: `GET`
*   **Endpoint**: `/companies/settings`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `COMPANY_ADMIN`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "id": 12,
        "name": "Alpha Retail",
        "gstRegistered": true,
        "gstin": "07AABCU9603R1ZN",
        "address": "123 Main St",
        "state": "Delhi",
        "phone": "9876543210"
      }
    }
    ```

*   **Method**: `PUT`
*   **Endpoint**: `/companies/settings`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `COMPANY_ADMIN`
*   **Request Body**:
    ```json
    {
      "name": "Alpha Retail Ltd",
      "gstRegistered": true,
      "gstin": "07AABCU9603R1ZN",
      "address": "456 Market Rd",
      "state": "Delhi",
      "phone": "9876543210"
    }
    ```
*   **Response (200 OK)**: `{ "success": true, "message": "Settings updated" }`

### 7.2 Bank Master & Merger
*   **Method**: `GET`
*   **Endpoint**: `/banks`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `COMPANY_ADMIN`, `STAFF`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        { "id": 1, "name": "SBI Current", "type": "BANK BOOK", "balance": 45000.00 }
      ]
    }
    ```

*   **Method**: `POST`
*   **Endpoint**: `/banks`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `COMPANY_ADMIN`
*   **Request Body**:
    ```json
    { "name": "HDFC Current", "type": "BANK BOOK", "balance": 12000.00 }
    ```
*   **Response (201 Created)**: `{ "success": true, "data": { "id": 2, "name": "HDFC Current", "balance": 12000.00 } }`

*   **Method**: `POST`
*   **Endpoint**: `/banks/merge`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `COMPANY_ADMIN`
*   **Request Body**:
    ```json
    { "sourceBankId": 1, "targetBankId": 2 }
    ```
*   **Response (200 OK)**: `{ "success": true, "message": "Bank accounts merged successfully" }`

### 7.3 Customer & Supplier Master
*   **Method**: `GET`
*   **Endpoint**: `/customers`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `COMPANY_ADMIN`, `STAFF`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        { "id": 5, "name": "Kiaan Patel", "phone": "9898989898", "balance": 1500.00, "status": "Active" }
      ]
    }
    ```

*   **Method**: `POST`
*   **Endpoint**: `/customers`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `COMPANY_ADMIN`, `STAFF`
*   **Request Body**:
    ```json
    { "name": "John Doe", "phone": "9999999999", "address": "New Delhi", "gstin": null, "balance": 0 }
    ```
*   **Response (201 Created)**: `{ "success": true, "data": { "id": 6, "name": "John Doe" } }`

### 7.4 Employee Master
*   **Method**: `GET`
*   **Endpoint**: `/employees`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `COMPANY_ADMIN`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        { "id": 15, "name": "Employee A", "role": "STAFF", "email": "staffa@osbooks.com" }
      ]
    }
    ```

*   **Method**: `POST`
*   **Endpoint**: `/employees`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `COMPANY_ADMIN`
*   **Request Body**:
    ```json
    { "name": "Jane Staff", "email": "jane@osbooks.com", "password": "tempPassword123" }
    ```
*   **Response (201 Created)**: `{ "success": true, "employeeId": 16 }`

### 7.5 Income Master & Register
*   **Method**: `GET`
*   **Endpoint**: `/incomes`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `COMPANY_ADMIN`, `STAFF`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        { "id": 1, "source": "Consulting Fee", "amount": 5000.00, "date": "2026-06-20T10:00:00Z" }
      ]
    }
    ```

*   **Method**: `POST`
*   **Endpoint**: `/incomes`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `COMPANY_ADMIN`
*   **Request Body**:
    ```json
    { "source": "Ad Revenue", "amount": 1200.00, "remark": "June payout" }
    ```
*   **Response (201 Created)**: `{ "success": true, "id": 2 }`

### 7.6 Expenses Master & Ledger
*   **Method**: `GET`
*   **Endpoint**: `/expenses`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `COMPANY_ADMIN`, `STAFF`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        { "id": 4, "category": "Rent", "amount": 25000.00, "date": "2026-06-01T00:00:00Z" }
      ]
    }
    ```

*   **Method**: `POST`
*   **Endpoint**: `/expenses`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `COMPANY_ADMIN`
*   **Request Body**:
    ```json
    { "category": "Office Supplies", "amount": 450.00, "remark": "Stationery" }
    ```
*   **Response (201 Created)**: `{ "success": true, "id": 5 }`

### 7.7 Payment Book (Payments Master)
*   **Method**: `GET`
*   **Endpoint**: `/payments`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `COMPANY_ADMIN`, `STAFF`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        { "id": 1, "voucherNo": "VOUCH-001", "payee": "Vendor X", "amount": 5000.00, "mode": "Bank" }
      ]
    }
    ```

### 7.8 Product Item Master
*   **Method**: `GET`
*   **Endpoint**: `/products`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `COMPANY_ADMIN`, `STAFF`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        { "id": 1, "name": "Wooden Chair", "sku": "FUR-WC-001", "mrp": 1200.00, "price": 999.00, "stock": 45 }
      ]
    }
    ```

*   **Method**: `POST`
*   **Endpoint**: `/products`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `COMPANY_ADMIN`
*   **Request Body**:
    ```json
    { "name": "Office Table", "sku": "FUR-OT-002", "mrp": 3500.00, "price": 2800.00, "stock": 10, "category": "Furniture" }
    ```
*   **Response (201 Created)**: `{ "success": true, "data": { "id": 2, "name": "Office Table" } }`

### 7.9 Unit Master
*   **Method**: `GET`
*   **Endpoint**: `/units`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `COMPANY_ADMIN`, `STAFF`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        { "id": 1, "name": "PCS" },
        { "id": 2, "name": "BOX" }
      ]
    }
    ```

### 7.10 Offer Management
*   **Method**: `GET`
*   **Endpoint**: `/offers`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `COMPANY_ADMIN`, `STAFF`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        { "id": 1, "title": "Diwali Offer", "discountPercentage": 10 }
      ]
    }
    ```

### 7.11 Stock Details & Adjustment
*   **Method**: `GET`
*   **Endpoint**: `/stocks`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `COMPANY_ADMIN`, `STAFF`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        { "id": 1, "productName": "Wooden Chair", "stock": 45, "warehouse": "Main Warehouse" }
      ]
    }
    ```

*   **Method**: `POST`
*   **Endpoint**: `/stocks/adjust`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `COMPANY_ADMIN`
*   **Request Body**:
    ```json
    { "productId": 1, "adjustmentQty": -2, "type": "DAMAGED" }
    ```
*   **Response (200 OK)**: `{ "success": true, "newStock": 43 }`

### 7.12 BOM (Bill of Materials) Master
*   **Method**: `GET`
*   **Endpoint**: `/boms`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `COMPANY_ADMIN`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        { "id": 1, "productId": 10, "components": [{ "productId": 1, "qty": 4 }] }
      ]
    }
    ```

*   **Method**: `POST`
*   **Endpoint**: `/boms`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `COMPANY_ADMIN`
*   **Request Body**:
    ```json
    { "productId": 10, "components": [{ "productId": 1, "qty": 4 }] }
    ```
*   **Response (201 Created)**: `{ "success": true, "bomId": 1 }`

### 7.13 Voucher Master
*   **Method**: `GET`
*   **Endpoint**: `/vouchers`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `COMPANY_ADMIN`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        { "id": 1, "voucherNo": "JV-001", "type": "JOURNAL", "amount": 1000.00 }
      ]
    }
    ```

### 7.14 Category Master
*   **Method**: `GET`
*   **Endpoint**: `/categories`
*   **Auth Requirement**: JWT Required
*   **Role Access**: `COMPANY_ADMIN`, `STAFF`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        { "id": 1, "name": "Furniture" }
      ]
    }
    ```

