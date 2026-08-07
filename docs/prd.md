# Product Requirements Document (PRD)

## 1. Project Overview
**Os Books (The Digital Accounting Book)** is a desktop-first, highly responsive web application designed for retail shops, firms, and small-to-medium businesses to handle double-entry accounting, real-time inventory management, high-throughput Point of Sale (POS) checkouts, and regulatory GST/HSN reporting. The frontend is built using React, Vite, and TailwindCSS (via PostCSS), featuring offline-first storage patterns (localStorage & sessionStorage) and dynamic multi-language translation.

---

## 2. Business Objective
The primary business objective is to streamline retail checkouts and accounting operations for small firms. By hosting a localized, visual interface that handles inventory tracking, ledger balances, compliance generation, and print setups on a single platform, Os Books minimizes errors, shortens transaction cycles, and establishes a secure, log-audited bookkeeping environment.

---

## 3. User Roles
The application identifies two primary roles:
1. **Admin User**: Full system access, firm configuration modification, financial reports visibility (Balance Sheet, P&L, Trading Accounts), ledger adjustment permissions, master record creation, delete logs recovery, and system settings manipulation.
2. **Employee / Cashier**: Restricted access primarily limited to POS Billing, invoice generation, customer master updates, and viewing general stock details. Restricted from final accounts, system print configs, and deleted record recovery.

---

## 4. Functional Requirements
The system must support the following core capabilities:
- **Firm Setup & Registration**: Initial setup of the business name, address lines, state compliance parameters, and GSTIN registry.
- **Account Masters**: Structuring bank accounts, company vendors, customer clients, categories, payment methods, bill-of-materials (BOM), warehouses, and branches.
- **Billing Engine**: Sales Invoice, Sales Order, Quotation, Customer Challan, Sales Return, and POS Billing.
- **Purchase Engine**: Purchase Order, Purchase Invoice, and Purchase Return management.
- **Accounting Ledgers**: Balance sheets, customer outstandings, bank books, expense/income books, employee records, and cash books.
- **Tax & Compliance**: GSTR-1, GSTR-2, GSTR-3B summaries, GST/HSN validation, and TCS reporting.
- **System Utilities**: Real-time print setup formatting, thermal ticket layouts, barcode creators, backup transfers, and audit logger logs.

---

## 5. Module-wise Requirements

### 5.1 Firm Configuration Module
* **Purpose**: Manages global firm metadata, address configurations, and GSTIN registration status.
* **Features**: Form submission, GSTIN input state lock/unlock, state classification, and multi-line address registration.
* **Inputs**: Firm Name (text), Contact Number (numeric/text), Address Line (text/select), State (select), GST Registration Status (boolean), GSTIN (text).
* **Outputs**: Firm configuration saved to local storage; application header title and logo updates.
* **Business Rules**:
  * If "Gst Registered" is FALSE, the GSTIN input must be disabled and cleared.
  * Contact Number is recommended to use WhatsApp-compatible numbers as the primary contact.
* **Validation Rules**:
  * Firm Name is mandatory.
  * GSTIN (if enabled) must match state-specific formats.
* **User Actions**: "Update" submits setup; "Cancel" redirects to Dashboard.

### 5.2 Dashboard Module
* **Purpose**: Provides quick visual indicators of daily sales, purchases, outstandings, ledger charts, and data privacy toggles.
* **Features**: Live metrics summation, blurred privacy switch, daily dates filtering, and direct creation shortcuts.
* **Inputs**: Date Filter (date picker), Blur Privacy Status (boolean).
* **Outputs**: Recharts sales-vs-purchase line charts, statistics card tallies, outstanding balances.
* **Business Rules**:
  * Activating "Privacy Mode" must immediately apply a blur filter (`blur-[8px]`) to all financial metrics and block pointer interactions.
  * Today's Sale info icon redirects to Customer Sales Summary; today's expense redirects to expense ledgers.
* **Validation Rules**: Date selection must not be in the future relative to system time.
* **User Actions**: Toggle Privacy, Refresh, Click Plus (+) on metric cards to create invoices.

### 5.3 Masters Module (Banks, Customers, Companies, Items, Employees, Expenses, Incomes, Units, Warehouses, Branches, BOM)
* **Purpose**: Central database for setting up references used in invoicing, accounts, and stock transactions.
* **Features**: Item/Vendor creation, category organization, warehouse transfers, multi-unit catalogs, and BOM assemblies.
* **Inputs**: Variable per master modal. Examples: Book Name, Book Type (CASH, BANK, WALLET, LOAN), Item SKU, Purchase Price, MRP, Sale Price, Warehouse Location.
* **Outputs**: Persistent reference lists, CSV data downloads, barcode associations.
* **Business Rules**:
  * Corrective merge capability must allow combining redundant accounts without loss of balance logs.
  * Item SKU code must be unique across the catalog.
* **Validation Rules**: 
  * Master names and unique identifiers cannot be empty.
  * Price inputs must be non-negative numbers.
* **User Actions**: Create New, Row Edit, View Barcode, Delete, and CSV Export.

### 5.4 POS Billing Module
* **Purpose**: Fast-paced checkout terminal with scanner focus and payment selection.
* **Features**: Scan auto-focus, touch-friendly hot items list, quick payment mode selection, hold checkout tickets, and thermal print simulator.
* **Inputs**: Barcode scanner string (text), Customer name/mobile, Quantity override, Payment Mode (Cash, Card, UPI).
* **Outputs**: Saved retail invoices, receipt metadata, simulated 3-inch thermal output.
* **Business Rules**:
  * Focus must lock on the barcode input box by default upon load.
  * Checkout requires at least 1 item in the cart.
* **Validation Rules**: Barcode query matches catalog ID; quantity must be a positive integer.
* **User Actions**: Scan, Add Quick Item, Update Qty, Hold, Pay & Print.

### 5.5 Sales and Purchases Invoicing Module
* **Purpose**: Comprehensive invoice setup with complex calculation systems, tax inclusions, and credit options.
* **Features**: Credit/Cash toggle, AI Invoice upload, inline product row addition, double discount brackets, freight tax adjustments, and automatic due allocations.
* **Inputs**: Customer Selector, Date, Product Name, Quantity, Free Qty, Base Price, Tax Included (boolean), Disc 1, Disc 2, Remarks, Freight Charges, Freight GST.
* **Outputs**: Formatted invoice files, automatic stock deductions, customer ledger adjustments, and audit log events.
* **Business Rules**:
  * Subtotal is calculated as: `(Quantity * Price)`.
  * Disc 1 (Percent/Value) reduces Subtotal; Disc 2 reduces remainder.
  * Free Qty adds to physical stock deduct count but carries 0 transaction value.
* **Validation Rules**: Base price and quantity must be greater than zero. Customer selection is required for credit transactions.
* **User Actions**: Add Row, Delete Row, Save, Convert Type, Print, and view Shortcut keys.

### 5.6 Ledger and Summaries Module
* **Purpose**: Double-entry financial journal mapping and outstandings audits.
* **Features**: Running ledger balance totals, credit history grids, daily cash books (Rojmel), and final balances calculations.
* **Inputs**: Date range, account type selector, payment voucher values.
* **Outputs**: Ledger report statements, outstanding totals.
* **Business Rules**:
  * Day book summaries must calculate exact cash opening and closing balances by tallying payments vs. receipts.
* **Validation Rules**: Start Date must be prior to or equal to End Date.
* **User Actions**: Filter dates, Print Ledger, Export Excel.

---

## 6. Screen-wise Requirements

### 6.1 Root Configuration `/` (Firm Setup)
- **Header**: Contains page name "Firm Registration" on an `#4F46E5` background, with close button leading to `/dashboard`.
- **Sidebar**: Hidden during registration.
- **Forms**: Dual-column container for firm name, mobile, address, state select, and GST registration fields.
- **Actions**: "Update" updates localized context; "Cancel" drops edits.

### 6.2 Home `/dashboard`
- **Header**: Top Navbar with system health indicators, print setups, and language select flags.
- **Sidebar**: Sidebar menu display active.
- **Widgets**: Recharts transaction curves, statistical metric widgets, and list alerts.
- **Actions**: Privacy mode switch, refresh cached session data.

### 6.3 Bank Details `/admin/bank_details`
- **Header**: Bank Details bar, Merge actions button, export buttons, and addition anchors.
- **Table**: Shows index, name, address, branches, account numbers, book type labels, and balances.
- **Modals**: Cash/Bank Master creation form, Merge accounts interface, and Barcode layout.

### 6.4 Stock Details `/admin/stock-details`
- **Header**: Item View and Brand-wise tabs, PDF download, and CSV export.
- **Filters**: Live catalog search text field, categories list filter, warehouse list filter, and stock level selectors.
- **Banners**: Active when rows are checked, allowing bulk edits and deletes.
- **Actions**: Group expand (Brand-wise), print preview sheet.

---

## 7. Form Requirements
Every system form must conform to standardized input types and layouts:
- **Text Inputs**: Clear placeholders (e.g., "Enter Product Name", "Firm Name / Business Name").
- **Dropdown Selects**: Default options (e.g., "Select State", "CASH BOOK") with touch selection support.
- **Numeric Fields**: Text-aligned to the right inside invoice grids, with step validations.
- **Datalists**: Combined search-select patterns for fast keyword match.
- **Toggle Switches**: Color-shifting indicators (Blue for Active/On, Gray/Red for Inactive/Off).

---

## 8. Validation Rules
The application validates fields at both input-level and form-submission boundaries:
- **GSTIN**: Must match a 15-character alpha-numeric regular expression when "Gst Registered" is active.
- **Dates**: Day-book dates and transaction records must be formatted as `DD-MM-YYYY` for client display, while using `YYYY-MM-DD` inputs.
- **Pricing**: Base Rate, MRP, and Purchase Cost must be positive float values. Sale Price must not be less than Purchase Price (warning indicator, not blocked).
- **Quantities**: Invoice quantity must be an integer >= 1. Free quantity must be an integer >= 0.

---

## 9. Table Requirements
- **Headers**: Dynamic column names fitted with `ChevronsUpDown` sort indicators.
- **Grid Layout**: Explicit grid dimensions mapping responsive boundaries (e.g. `grid-cols-[60px_200px_1fr_150px_150px_150px_150px_150px_120px]` for bank logs).
- **Row Action Buttons**: Action panels containing Menu (dark), Edit (indigo), and Delete (red) control widgets.
- **No Data Indicator**: Standardized empty list layouts rendering descriptive notices (e.g., "No bank details found matching X").

---

## 10. Search & Filter Requirements
- **Search Boxes**: Interactive search bars matching query inputs to item SKU, brand name, and product titles.
- **Category Selectors**: Live filters fetching unique categories present in the active dataset.
- **Stock Status Selects**:
  - **In Stock**: Filter items where stock >= 10.
  - **Low Stock**: Filter items where stock > 0 and stock < 10.
  - **Out of Stock**: Filter items where stock == 0.

---

## 11. Dashboard Requirements
- **Statistics Cards**: Top widgets showing daily sales, purchases, stock flags, and expenses with quick redirect links.
- **Visual Analytics**: Interactive Recharts tracking comparative sales histories.
- **Privacy Masking**: A global context toggle that applies a graphical blur overlay to keep data hidden from bystanders during presentations.

---

## 12. Reporting Requirements
- **PDF Reports**: Utilizes `html2canvas` to render off-screen HTML layouts followed by `jsPDF` to compile standard A4 format pages.
- **CSV/Excel Export**: Builds localized file downloads via blob URL wrappers.
- **Layout Margins**: Configured dynamically inside Print Settings.

---

## 13. Notification Requirements
- **System Badges**: Top Navbar displays dynamic alerts (e.g., License validity expiration countdown: "Validity - 30-May-2026 6 days left").
- **Stock Indicators**: Inline tables must show alert warnings (e.g. `AlertCircle` icon next to stock counts < 10).
- **Push Settings**: Manage permissions via `/admin/notification-permission`.

---

## 14. User Permissions & Access Control
- **Access Profiles**:
  - **Administrator**: Full viewing and mutation rights across all database resources.
  - **Cashier**: Access limited to invoice creations and basic summaries. Restructured from Audit Logs and print settings alterations.

---

## 15. Workflow Definitions

### 15.1 POS Checkout Flow
1. Load POS billing path (`/admin/pos`).
2. Laser barcode reader scans code. Focus auto-centers to barcode field.
3. Item details are parsed and added to the cart array.
4. Total payable sum is computed dynamically incorporating taxes and discount exclusions.
5. User selects payment mode (Cash, Card, UPI) and clicks checkout.
6. The POS thermal receipt is simulated, and transaction details are recorded.

### 15.2 Sales Billing Flow
1. Open invoice creation template.
2. Select target Customer Name and configure Date.
3. Add billing item rows, adjusting base cost, quantities, and discounts (D1, D2).
4. Auto-calculate subtotals, tax allocations (CGST/SGST), freight weights, and final sum.
5. Save inputs to register financial journals and decrease inventory quantities.

---

## 16. Audit & Activity Tracking
The application uses the `AuditLogContext` system to record system operations. Every event must log:
- **Timestamp**: Exact record time.
- **User details**: Active operator name and security role (e.g. Admin User, Cashier).
- **Action Type**: Transaction class (Create, Edit, Delete).
- **Invoice/Bill ID**: Connected record identifier.
- **Audit diffs**: Payload structure capturing updated properties (`previousData` vs. `updatedData`).
- **IP Address**: Source IP configuration logs.

---

## 17. Error Handling Requirements
- **Product Retrieval**: Return warning alert message ("Product not found!") when scanner registers unregistered codes.
- **Data corruption**: Trap file parsing issues inside local storage operations and rebuild with defaults.
- **Empty checkouts**: Block payments if cart list holds 0 items.

---

## 18. Non-Functional Requirements
- **Performance**: POS grid updates and item additions must execute in under 100ms.
- **Local Storage Reliability**: Active sessions must backup catalog lists to localStorage to guarantee data recovery upon tab crash.
- **Responsiveness**: Form fields must stack vertically on mobile grids, hiding minor columns while preserving total invoice totals.
- **Localization**: Supports dynamic translation switching across: English, Hindi, Gujarati, Marathi, Punjabi, Tamil, Telugu, Bengali, Kannada, and Malayalam.

---

## 19. Security Requirements
- **Session Privacy**: Global blurring toggles protect private details from bystander exposure.
- **Database Clears**: Session logs must be cleared from storage buffers upon hard system refresh operations.

---

## 20. Acceptance Criteria
1. The Firm Setup form must successfully write business details to client storage and update application titles.
2. POS checkout must auto-focus inputs and permit thermal ticket prints.
3. Double discount calculations must exactly match standard discount subtraction rules.
4. Stock quantities must deduct corresponding items automatically when invoices are saved.
5. Final accounts statements (P&L, Balance Sheet) must balance debits and credits correctly.
