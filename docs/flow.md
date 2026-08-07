# Application Workflows & Diagrams

This document outlines the operational workflows, user actions, data loops, and execution diagrams for the core features of the **Os Books (The Digital Accounting Book)** system.

---

## 1. POS Retail Checkout Flow

### 1.1 Process Steps
1.  **Scanner Focus Lock**: Upon loading `/admin/pos`, the cursor auto-focuses onto the barcode input.
2.  **Code Identification**: The operator scans an item barcode or types search queries.
3.  **Cart Updates**:
    *   If the barcode matches a catalog item, the system appends the item or increments its quantity.
    *   Subtotal, tax weights, and net totals recalculate.
4.  **Checkout & Payment**: The operator selects a payment method (Cash, Card, UPI) and clicks "PAY & PRINT BILL".
5.  **Receipt Generation**: The thermal print overlay triggers, and the session cart resets for the next scan.

### 1.2 Checkout Sequence Flowchart

```mermaid
graph TD
    Start([Load POS Terminal /admin/pos]) --> FocusInput[Auto-Focus Barcode Search Input]
    FocusInput --> ScanInput{User Scans Barcode or Searches Item}
    
    ScanInput -- Barcode Scanned --> SearchDB[Query Catalog Database]
    SearchDB -- Item Found --> CheckCart{Item already in Cart?}
    SearchDB -- Item Not Found --> AlertErr[Show 'Product not found!' Alert] --> FocusInput
    
    CheckCart -- Yes --> IncrementQty[Increment Row Qty by 1] --> UpdateTotals[Recalculate Subtotal, Tax, and Net Payable]
    CheckCart -- No --> AddNewRow[Append Item Row to Cart with Qty=1] --> UpdateTotals
    
    UpdateTotals --> ChoosePay[Select Payment Mode: CASH / CARD / UPI]
    ChoosePay --> ClickPay[Click 'PAY & PRINT BILL']
    
    ClickPay --> ShowModal[Display 3-inch Thermal Print Receipt Modal]
    ShowModal --> ClickPrint[User Clicks Print Receipt]
    ClickPrint --> TriggerPrint[Trigger window.print]
    TriggerPrint --> ResetCart[Clear Cart State & Reset Customer Form]
    ResetCart --> FocusInput
```

---

## 2. Sales Invoice Creation Flow

### 2.1 Process Steps
1.  **Header Setup**: The billing user sets the billing mode (Cash or Credit) and selects/inputs customer details.
2.  **Item Entry**:
    *   Rows are added inside the item grid with product selectors, base prices, quantity rates, and free quantity allotments.
    *   **Double Brackets Discounts**: Discount 1 acts first on the row base sum; Discount 2 is calculated on the remaining balance.
3.  **Summary Adjustments**: The user configures manual invoice-level discount percentages and freight charges.
4.  **Registry Completion**: Clicking "Save" logs the transaction, updates ledger balances, and deducts physical inventory items from the active warehouse catalog.

### 2.2 Invoicing State Flowchart

```mermaid
graph TD
    StartInvoice([Open Invoice Creator /admin/sales-invoice]) --> SetBillingMode[Set Cash/Credit Toggle Switch]
    SetBillingMode --> SelectCust[Select Customer Name & Configure Date]
    
    SelectCust --> InputItemRow[Input Item Name, Qty, Free Qty, Base Price]
    InputItemRow --> CalcRowBase[Calculate Row Base Total: Qty * Price]
    
    CalcRowBase --> ApplyD1[Apply Disc 1 Value/% to Base Total]
    ApplyD1 --> ApplyD2[Apply Disc 2 Value/% to Remaining Balance]
    ApplyD2 --> CalcRowAmt[Calculate Row Amount & Display in Row Grid]
    
    CalcRowAmt --> AddMoreRows{Add more items?}
    AddMoreRows -- Yes --> InputItemRow
    AddMoreRows -- No --> SummaryConfig[Configure Freight Charges & Global Discount Overrides]
    
    SummaryConfig --> ComputeGrandTotal[Calculate Net Final Amount]
    ComputeGrandTotal --> ClickSave[Click Save Button]
    
    ClickSave --> DeductInventory[Deduct Stock Quantities: Qty + Free Qty]
    DeductInventory --> AppendLedger[Log Balance to Party Ledger Accounts]
    AppendLedger --> WriteAuditLog[Write Action Event to System Audit Logs]
    WriteAuditLog --> Complete([Display Success Message & Clear Billing Template])
```

---

## 3. Account Ledger Merger Flow

### 3.1 Process Steps
1.  **Initiation**: The user clicks the "Merge" action inside the Bank Details panel.
2.  **Validation Check**: The user selects the incorrect account profile and the correct target profile.
3.  **Balance Summation**: The balance of the incorrect account is added to the target profile.
4.  **Database Write**: The incorrect account is deleted, and the updated database is written to local storage.

### 3.2 Merger Execution Flowchart

```mermaid
graph TD
    StartMerge([Click Merge Button inside Bank Master]) --> OpenMergeModal[Display Bank Correction Modal]
    OpenMergeModal --> SelectSource[Select Incorrect Bank Name Source]
    SelectSource --> SelectTarget[Select Correct Bank Name Destination]
    
    SelectTarget --> ClickConfirm[Click Merge Action Button]
    ClickConfirm --> VerifySelection{Are source and target different?}
    
    VerifySelection -- No --> ShowError[Display Validation Error] --> OpenMergeModal
    VerifySelection -- Yes --> AddBalances[Add Source Balance to Destination Account]
    
    AddBalances --> DeleteSource[Delete Source Account Master Row]
    DeleteSource --> UpdateStorage[Write New Accounts Array to LocalStorage]
    UpdateStorage --> DispatchRefresh[Dispatch Event to Refresh active Lists]
    DispatchRefresh --> CloseModal[Close Merger Modal Panel]
```

---

## 4. Multi-Language Switcher Flow

### 4.1 Process Steps
1.  The user selects a locale (e.g., Hindi, Gujarati, Marathi) from the top navigation language dropdown.
2.  The i18n instance shifts active locale namespaces.
3.  Translation cookies are written to ensure persistent translations on reload.
4.  The system triggers a page hard-refresh to apply the translations.

### 4.2 Translation Flowchart

```mermaid
graph TD
    StartLang([Select Language in TopNavbar Dropdown]) --> GetSelectedVal[Capture Lang Selection Code: en, hi, gu, mr, etc.]
    GetSelectedVal --> TriggerChange[Call i18n.changeLanguage]
    TriggerChange --> WriteStorage[Save Lang Selection to localStorage]
    
    WriteStorage --> CheckLang{Is language English?}
    CheckLang -- Yes --> DeleteCookie[Delete Google Translate Cookie 'googtrans'] --> TriggerReload[Reload Active Window Context]
    CheckLang -- No --> WriteCookie[Write Cookie 'googtrans=/en/lang_code'] --> TriggerReload
    
    TriggerReload --> LoadTranslations[Retrieve Translation Resource File]
    LoadTranslations --> RenderUI[Render UI Components in Selected Language]
```
