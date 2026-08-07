# Client-Side Database & Storage Schema

This document details the data structures, schemas, validation logic, and storage strategies for the **Os Books (The Digital Accounting Book)** frontend client. As a client-first application, data persistence relies on browser `localStorage` and `sessionStorage`.

---

## 1. Storage Overview

The application utilizes three forms of data preservation:

1.  **LocalStorage (Persistent Databases)**: Holds catalog masters, configuration profiles, ledger balances, and audit trails that remain saved when the browser tab is closed.
2.  **SessionStorage (Cache & Transactions)**: Holds active cart lists, form inputs in progress, and query filters. This cache is cleared upon tab closure or system hard refresh.
3.  **Local State (In-Memory React Contexts)**: Holds runtime environment flags, active language states, and transient modal views.

---

## 2. LocalStorage Schema Definitions

Below are the detailed JSON schemas for all persistent datasets.

### 2.1 Firm Details Database (`firmDetails`)
*   **Key**: `firmDetails`
*   **Structure**: Single JSON Object
*   **Purpose**: Manages active business configurations.

| Field Name | Data Type | Mandatory | Description |
| :--- | :--- | :--- | :--- |
| `firmName` | String | Yes | Name of the business/firm. |
| `contactNumber` | String | Yes | Primary contact phone/WhatsApp number. |
| `addressLine` | String | Yes | Core street and office location details. |
| `state` | String | Yes | State selector matching tax jurisdictions. |
| `gstRegistered` | Boolean | Yes | Flag indicating whether the business collects GST. |
| `gstin` | String | No | 15-character GSTIN. Nullable if `gstRegistered` is false. |

*   **Sample Data**:
    ```json
    {
      "firmName": "OS Books Retail",
      "contactNumber": "9876543210",
      "addressLine": "123 Main Market, Ground Floor",
      "state": "Delhi",
      "gstRegistered": true,
      "gstin": "07AABCU9603R1ZN"
    }
    ```

### 2.2 Bank Details / Ledger Accounts Database (`bankDetailsRows`)
*   **Key**: `bankDetailsRows`
*   **Structure**: JSON Array of Objects
*   **Purpose**: Tracks active ledger bank accounts, cash registers, and payment gateways.

| Field Name | Data Type | Mandatory | Description |
| :--- | :--- | :--- | :--- |
| `id` | Number (Integer) | Yes | Unique timestamp-based account identifier. |
| `name` | String | Yes | Account/UPI ledger label (e.g., "SBI Current Account"). |
| `type` | String | Yes | Enum: `CASH BOOK`, `BANK BOOK`, `WALLET-BOOK`, `LOAN BOOK`, `NON-PAYMENT BOOK`. |
| `balance` | Number (Float) | Yes | Current running balance (positive or negative). |
| `address` | String | No | Branch address parameters (optional). |

*   **Sample Data**:
    ```json
    [
      {
        "id": 1,
        "name": "Cash Account",
        "type": "CASH BOOK",
        "balance": 5240.50,
        "address": "Main Vault"
      },
      {
        "id": 1717589620000,
        "name": "HDFC Current Account",
        "type": "BANK BOOK",
        "balance": 125400.00,
        "address": "Connaught Place Branch"
      }
    ]
    ```

### 2.3 Product Catalog & Stock Database (`products`)
*   **Key**: `products`
*   **Structure**: JSON Array of Objects
*   **Purpose**: Manages the product inventory list, pricing structures, and stock balances.

| Field Name | Data Type | Mandatory | Description |
| :--- | :--- | :--- | :--- |
| `id` | Number (Integer) | Yes | Unique catalog item identifier. |
| `productName`| String | Yes | Complete item description. |
| `sku` | String | Yes | Unique SKU code (Stock Keeping Unit). |
| `brandName` | String | Yes | Brand grouping details. |
| `category` | String | Yes | Category classification parameters. |
| `gst` | String | Yes | Tax bracket representation (e.g., "18%", "5%"). |
| `hsn` | String | Yes | Harmonized System Nomenclature compliance code. |
| `unit` | String | Yes | Unit of Measure UQC (e.g., "PCS", "BOX", "MTR"). |
| `purchasePrice`| Number (Float) | Yes | Original purchase cost per unit. |
| `mrp` | Number (Float) | Yes | Maximum Retail Price. |
| `sale` | Number (Float) | Yes | Active retail selling price. |
| `stock` | Number (Float) | Yes | Running physical quantity available. |
| `warehouse` | String | Yes | Warehouse location assignment. |
| `status` | String | Yes | Enum: `Active`, `Inactive`. |

*   **Sample Data**:
    ```json
    [
      {
        "id": 1,
        "productName": "Wooden Chair",
        "sku": "FUR-WC-001",
        "brandName": "Brand A",
        "category": "Furniture",
        "gst": "18%",
        "hsn": "9401",
        "unit": "PCS",
        "purchasePrice": 800,
        "mrp": 1200,
        "sale": 999,
        "stock": 45,
        "warehouse": "Main Warehouse",
        "status": "Active"
      }
    ]
    ```

### 2.4 System Audit Trails (`auditLogs`)
*   **Key**: `auditLogs`
*   **Structure**: JSON Array of Objects
*   **Purpose**: Records administrative events and changes.

| Field Name | Data Type | Mandatory | Description |
| :--- | :--- | :--- | :--- |
| `id` | String / Number | Yes | Unique event ID. |
| `timestamp` | String (ISO) | Yes | Standardized ISO generation date-time. |
| `userName` | String | Yes | Operator username. |
| `userRole` | String | Yes | Role profile (e.g., "Admin", "Cashier"). |
| `actionType` | String | Yes | Enum: `Create`, `Edit`, `Delete`. |
| `billNumber` | String | No | Connected transaction ID (if billing event). |
| `moduleName` | String | Yes | Target module parameter (e.g., "Sales Invoice"). |
| `previousData`| Object / Null | No | JSON state of target row before edit operation. |
| `updatedData` | Object / Null | No | JSON state of target row after edit operation. |
| `ipAddress` | String | Yes | Local network IP of the active terminal client. |

*   **Sample Data**:
    ```json
    [
      {
        "id": "log_1717589990",
        "timestamp": "2026-06-05T15:20:50+05:30",
        "userName": "Admin User",
        "userRole": "Admin",
        "actionType": "Edit",
        "billNumber": "INV-5896",
        "moduleName": "Sales Invoice",
        "previousData": { "qty": 10, "price": 1000 },
        "updatedData": { "qty": 12, "price": 1000 },
        "ipAddress": "192.168.1.5"
      }
    ]
    ```

### 2.5 Print Configuration Database (`printSettings`)
*   **Key**: `printSettings`
*   **Structure**: Single JSON Object
*   **Purpose**: Custom invoice template layout dimensions.

| Field Name | Data Type | Mandatory | Description |
| :--- | :--- | :--- | :--- |
| `paperSize` | String | Yes | Enum: `A4`, `A5`, `3-INCH`. |
| `marginTop` | Number | Yes | Document margin spacing in millimeters. |
| `marginBottom`| Number | Yes | Document margin spacing in millimeters. |
| `primaryColor`| String (Hex) | Yes | Hex color code for print titles (default `#4F46E5`). |
| `showLogo` | Boolean | Yes | Flag indicating whether the business logo is printed. |
| `termsText` | String | Yes | Multi-line business terms and conditions text. |

---

## 3. SessionStorage Schema Definitions

Below are the cached, transient structures that do not persist across active browser sessions.

### 3.1 Active POS Cart Cache (`posActiveCart`)
*   **Key**: `posActiveCart`
*   **Structure**: JSON Array of Objects
*   **Purpose**: Retains POS cart state during transaction setups.

| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | Number | Product reference ID. |
| `name` | String | Product description. |
| `price` | Number | Selling price. |
| `qty` | Number | Purchase quantity (positive integer). |
| `tax` | Number | Tax rate percentage. |
| `total` | Number | Pre-calculated row amount `(price * qty)`. |

*   **Sample Data**:
    ```json
    [
      {
        "id": 1,
        "name": "Parle G 250g",
        "price": 20.00,
        "qty": 5,
        "tax": 5,
        "total": 100.00
      }
    ]
    ```

---

## 4. Key Storage Calculations & Operations

### 4.1 Master Record Merge Algorithm (Bank Details)
When merging account references:
1.  Read the current `bankDetailsRows` array.
2.  Locate the source record (incorrect account name) and the destination record (correct account name).
3.  Add the source balance to the destination balance:
    $$\text{balance}_{\text{dest}} = \text{balance}_{\text{dest}} + \text{balance}_{\text{source}}$$
4.  Remove the source account record from the array.
5.  Write the modified array back to `localStorage`.
6.  Dispatch a state event to refresh list components.

### 4.2 Invoicing Inventory Deductions
Upon saving a sales invoice:
1.  Read the `products` catalog array from storage.
2.  Iterate through the product lines of the invoice.
3.  For each product match, adjust the stock balance:
    $$\text{stock}_{\text{new}} = \text{stock}_{\text{current}} - (\text{quantity}_{\text{sold}} + \text{quantity}_{\text{free}})$$
4.  Update the `products` catalog array in `localStorage`.
