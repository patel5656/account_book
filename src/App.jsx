import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { SuperadminLayout } from './layouts/SuperadminLayout';
import { Dashboard } from './pages/Dashboard';
import { SuperadminDashboard } from './pages/superadmin/SuperadminDashboard';
import { CompanyManagement } from './pages/superadmin/CompanyManagement';
import { SubscriptionManagement } from './pages/superadmin/SubscriptionManagement';
import { SuperadminSupport } from './pages/superadmin/SuperadminSupport';
import { GlobalSettings } from './pages/superadmin/GlobalSettings';
import { FirmRegistration } from './pages/FirmRegistration';
import { SalesInvoiceSummary } from './pages/SalesInvoiceSummary';
import { SalesInvoice } from './pages/SalesInvoice';
import { BankLedger } from './pages/BankLedger';
import { AllBookBalance } from './pages/AllBookBalance';
import { PurchaseInvoice } from './pages/PurchaseInvoice';
import { PurchaseOrder } from './pages/PurchaseOrder';
import { StockDetails } from './pages/StockDetails';
import { ExpenseLedgerInput } from './pages/ExpenseLedgerInput';
import { IncomeLedgerInput } from './pages/IncomeLedgerInput';
import { PaymentLedger } from './pages/PaymentLedger';
import { ExpenseLedgerReport } from './pages/ExpenseLedgerReport';
import { EmployeeAttendance } from './pages/EmployeeAttendance';
import { SaleSummary } from './pages/SaleSummary';
import { PurchaseSummary } from './pages/PurchaseSummary';
import { CashBankSummary } from './pages/CashBankSummary';
import { ExpiryReport } from './pages/ExpiryReport';
import { OrderList } from './pages/OrderList';
import { BrandwiseSaleSummary } from './pages/BrandwiseSaleSummary';
import { BrandwisePurchaseSummary } from './pages/BrandwisePurchaseSummary';
import { CategorywiseSaleSummary } from './pages/CategorywiseSaleSummary';
import { CategorywisePurchaseSummary } from './pages/CategorywisePurchaseSummary';
import { ItemwiseSaleSummary } from './pages/ItemwiseSaleSummary';
import { ItemwisePurchaseSummary } from './pages/ItemwisePurchaseSummary';
import { EmployeewiseSaleSummary } from './pages/EmployeewiseSaleSummary';
import { InvoicesReport } from './pages/InvoicesReport';
import { CustomerLedger } from './pages/CustomerLedger';
import { CustomerOutstanding } from './pages/CustomerOutstanding';
import { CompanyLedger } from './pages/CompanyLedger';
import { CompanyOutstanding } from './pages/CompanyOutstanding';
import { DayBookSummary } from './pages/DayBookSummary';
import { BankDetails } from './pages/BankDetails';
import { CompanyMaster } from './pages/CompanyMaster';
import { CustomerMaster } from './pages/CustomerMaster';
import { CategoryMaster } from './pages/CategoryMaster';
import { EmployeeMaster } from './pages/EmployeeMaster';
import { ExpenseMaster } from './pages/ExpenseMaster';
import { IncomeMaster } from './pages/IncomeMaster';
import { PaymentMaster } from './pages/PaymentMaster';
import { ItemMaster } from './pages/ItemMaster';
import { OfferManagement } from './pages/OfferManagement';
import { BomMaster } from './pages/BomMaster';
import { VoucherMaster } from './pages/VoucherMaster';
import { Purchase } from './pages/Purchase';
import { PurchaseReturn } from './pages/PurchaseReturn';
import { SalesReturnSummary } from './pages/SalesReturnSummary';
import { Quotation } from './pages/Quotation';
import { StockAdjustment } from './pages/StockAdjustment';
import { StockInventory } from './pages/StockInventory';
import { EmployeeLedger } from './pages/EmployeeLedger';
import { TradingAccount } from './pages/TradingAccount';
import { ProfitLossAccount } from './pages/ProfitLossAccount';
import { BalanceSheet } from './pages/BalanceSheet';
import { TcsReport } from './pages/TcsReport';
import { DailyCashBook } from './pages/DailyCashBook';
import { Gstr1Summary } from './pages/Gstr1Summary';
import { Gstr2Summary } from './pages/Gstr2Summary';
import { Gstr3bSummary } from './pages/Gstr3bSummary';
import { GstrSaleSummary } from './pages/GstrSaleSummary';
import { GstrSaleReturn } from './pages/GstrSaleReturn';
import { GstrPurchaseSummary } from './pages/GstrPurchaseSummary';
import { GstrPurchaseReturn } from './pages/GstrPurchaseReturn';
import { GstWiseSummary } from './pages/GstWiseSummary';
import { HsnWiseSummary } from './pages/HsnWiseSummary';
import { UnitCatalogMaster } from './pages/UnitCatalogMaster';
import { ComplaintDetails } from './pages/ComplaintDetails';
import { ServiceReminder } from './pages/ServiceReminder';
import { BarcodePage } from './pages/BarcodePage';
import { PrintSetting } from './pages/PrintSetting';
import { HsnGstError } from './pages/HsnGstError';
import { StockPriceUpdate } from './pages/StockPriceUpdate';
import { ItemQuantityReport } from './pages/ItemQuantityReport';
import { ViewDeletedEntry } from './pages/ViewDeletedEntry';
import { NotificationPermission } from './pages/NotificationPermission';
import { HardRefreshPage } from './pages/HardRefreshPage';
import { StockAdjustmentForm } from './pages/StockAdjustmentForm';
import { AuditLogs } from './pages/AuditLogs';
import { PosBilling } from './pages/PosBilling';
import { BranchMaster } from './pages/BranchMaster';
import { WarehouseMaster } from './pages/WarehouseMaster';
import { LocationMaster } from './pages/LocationMaster';
import { GodownTransfer } from './pages/GodownTransfer';
import { BillBook } from './pages/BillBook';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { BankStatementImport } from './pages/BankStatementImport';
import { LandingPage } from './pages/LandingPage';
import { PublicBillPage } from './pages/PublicBillPage';
import { ViewUser } from './pages/ViewUser';
import { ProfilePage } from './pages/ProfilePage';
import { ProtectedRoute } from './components/ProtectedRoute';

import { SettingsProvider } from './context/SettingsContext';

function App() {
  return (
    <SettingsProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Public Bill Page - no login required */}
          <Route path="/bill/:invoiceNo" element={<PublicBillPage />} />

          {/* Superadmin Routes */}
          <Route path="/superadmin/*" element={
            <ProtectedRoute>
              <SuperadminLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="dashboard" />} />
                  <Route path="dashboard" element={<SuperadminDashboard />} />
                  <Route path="companies" element={<CompanyManagement />} />
                  <Route path="subscriptions" element={<SubscriptionManagement />} />
                  <Route path="support" element={<SuperadminSupport />} />
                  <Route path="settings" element={<GlobalSettings />} />
                  <Route path="*" element={<Navigate to="dashboard" />} />
                </Routes>
              </SuperadminLayout>
            </ProtectedRoute>
          } />

          {/* Regular Tenant Routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/login" />} />
                  <Route path="/admin/registration" element={<FirmRegistration />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/admin/invoice-details/customer_sale" element={<SalesInvoiceSummary />} />
                  <Route path="/admin/invoice-details/customer_sale_order" element={<SalesInvoiceSummary />} />
                  <Route path="/admin/invoice-details/customer_challan_invoice" element={<SalesInvoiceSummary />} />
                  <Route path="/admin/sales-order-invoice" element={<SalesInvoice />} />
                  <Route path="/admin/customer-invoice-creation" element={<SalesInvoice />} />
                  <Route path="/admin/customer-challan-creation" element={<SalesInvoice />} />
                  <Route path="/admin/sales-invoice" element={<SalesInvoice />} />
                  <Route path="/admin/sales-return-invoice" element={<SalesInvoice />} />
                  <Route path="/admin/quotation-invoice" element={<SalesInvoice />} />
                  <Route path="/admin/create_invoices/company_purchase" element={<PurchaseInvoice />} />
                  <Route path="/admin/create_invoices/company_purchase_return" element={<PurchaseInvoice />} />
                  <Route path="/admin/create_invoices/company_purchase_order" element={<PurchaseOrder />} />
                  <Route path="/admin/invoice-details/company_purchase_order" element={<Purchase />} />
                  <Route path="/admin/stock-details" element={<StockDetails />} />
                  <Route path="/admin/bank-ledger" element={<BankLedger />} />
                  <Route path="/admin/allbookbalance" element={<AllBookBalance />} />
                  <Route path="/admin/expenses-ledger/expense_ledger" element={<ExpenseLedgerInput />} />
                  <Route path="/admin/expenses_report/expense_ledger" element={<ExpenseLedgerReport />} />
                  <Route path="/admin/incomes-ledger/income_ledger" element={<IncomeLedgerInput />} />
                  <Route path="/admin/cashbook-ledger/payment_ledger" element={<PaymentLedger />} />
                  <Route path="/admin/party-ledger/customer_payment" element={<CustomerLedger />} />
                  <Route path="/admin/party_outstanding/customer_outstanding" element={<CustomerOutstanding />} />
                  <Route path="/admin/party-ledger/company_payment" element={<CompanyLedger />} />
                  <Route path="/admin/party_outstanding/company_outstanding" element={<CompanyOutstanding />} />
                  <Route path="/admin/employee_attendance" element={<EmployeeAttendance />} />
                  <Route path="/admin/sale_summary" element={<SaleSummary />} />
                  <Route path="/admin/purchase_summary" element={<PurchaseSummary />} />
                  <Route path="/admin/cash_bank_summary" element={<CashBankSummary />} />
                  <Route path="/admin/day_book_summary" element={<DayBookSummary />} />
                  <Route path="/admin/expiry_report" element={<ExpiryReport />} />
                  <Route path="/admin/order_list" element={<OrderList />} />
                  <Route path="/admin/inventory-summary/brandwise-sale" element={<BrandwiseSaleSummary />} />
                  <Route path="/admin/inventory-summary/brandwise-purchase" element={<BrandwisePurchaseSummary />} />
                  <Route path="/admin/inventory-summary/categorywise-sale" element={<CategorywiseSaleSummary />} />
                  <Route path="/admin/inventory-summary/categorywise-purchase" element={<CategorywisePurchaseSummary />} />
                  <Route path="/admin/inventory-summary/itemwise-sale" element={<ItemwiseSaleSummary />} />
                  <Route path="/admin/inventory-summary/itemwise-purchase" element={<ItemwisePurchaseSummary />} />
                  <Route path="/admin/inventory-summary/employeewise-sale" element={<EmployeewiseSaleSummary />} />
                  <Route path="/admin/inventory-summary/invoices-report" element={<InvoicesReport />} />
                  <Route path="/admin/bank_details" element={<BankDetails />} />
                  <Route path="/admin/company_master" element={<CompanyMaster />} />
                  <Route path="/admin/customer_master" element={<CustomerMaster />} />
                  <Route path="/admin/category_master" element={<CategoryMaster />} />
                  <Route path="/admin/employee_master" element={<EmployeeMaster />} />
                  <Route path="/admin/expense_master" element={<ExpenseMaster />} />
                  <Route path="/admin/income_master" element={<IncomeMaster />} />
                  <Route path="/admin/payment_master" element={<PaymentMaster />} />
                  <Route path="/admin/item_master" element={<ItemMaster />} />
                  <Route path="/admin/offer_management" element={<OfferManagement />} />
                  <Route path="/admin/product_master" element={<StockDetails />} />
                  <Route path="/admin/unit_catalog_master" element={<UnitCatalogMaster />} />
                  <Route path="/admin/bom_master" element={<BomMaster />} />
                  <Route path="/admin/voucher_master" element={<VoucherMaster />} />
                  <Route path="/admin/purchase" element={<Purchase />} />
                  <Route path="/admin/purchase_return" element={<PurchaseReturn />} />
                  <Route path="/admin/godown_transfer" element={<GodownTransfer />} />
                  <Route path="/admin/pos" element={<PosBilling />} />
                  <Route path="/admin/branch_master" element={<BranchMaster />} />
                  <Route path="/admin/warehouse_master" element={<WarehouseMaster />} />
                  <Route path="/admin/location_master" element={<LocationMaster />} />
                  <Route path="/admin/sales" element={<SalesInvoiceSummary />} />
                  <Route path="/admin/sales_return" element={<SalesReturnSummary />} />
                  <Route path="/admin/quotation" element={<Quotation />} />
                  <Route path="/admin/stock_adjustment" element={<StockAdjustment />} />
                  <Route path="/admin/stock-adjustment-invoice" element={<StockAdjustmentForm />} />
                  <Route path="/admin/stock_inventory" element={<StockInventory />} />
                  <Route path="/admin/employee_ledger" element={<EmployeeLedger />} />
                  <Route path="/admin/final-accounts/trading-account" element={<TradingAccount />} />
                  <Route path="/admin/final-accounts/profit-loss" element={<ProfitLossAccount />} />
                  <Route path="/admin/final-accounts/balance-sheet" element={<BalanceSheet />} />
                  <Route path="/admin/final-accounts/tcs-report" element={<TcsReport />} />
                  <Route path="/admin/final-accounts/rojmel" element={<DailyCashBook />} />
                  <Route path="/admin/gstr-summary/gstr-1" element={<Gstr1Summary />} />
                  <Route path="/admin/gstr-summary/gstr-2" element={<Gstr2Summary />} />
                  <Route path="/admin/gstr-summary/gstr-3b" element={<Gstr3bSummary />} />
                  <Route path="/admin/gstr-summary/sale-summary" element={<GstrSaleSummary />} />
                  <Route path="/admin/gstr-summary/sale-return" element={<GstrSaleReturn />} />
                  <Route path="/admin/gstr-summary/purchase-summary" element={<GstrPurchaseSummary />} />
                  <Route path="/admin/gstr-summary/purchase-return" element={<GstrPurchaseReturn />} />
                  <Route path="/admin/gstr-summary/gst-wise" element={<GstWiseSummary />} />
                  <Route path="/admin/gstr-summary/hsn-wise" element={<HsnWiseSummary />} />
                  <Route path="/admin/complaint_details" element={<ComplaintDetails />} />
                  <Route path="/tools/complaint" element={<ComplaintDetails />} />
                  <Route path="/admin/service_reminder" element={<ServiceReminder />} />
                  <Route path="/tools/service-reminder" element={<ServiceReminder />} />
                  <Route path="/admin/barcode" element={<BarcodePage />} />
                  <Route path="/tools/barcode" element={<BarcodePage />} />
                  <Route path="/admin/print-setting" element={<PrintSetting />} />
                  <Route path="/admin/hsn_error" element={<HsnGstError />} />
                  <Route path="/tools/hsn-gst-error" element={<HsnGstError />} />
                  <Route path="/admin/stock-price-update" element={<StockPriceUpdate />} />
                  <Route path="/tools/stock-price-update" element={<StockPriceUpdate />} />
                  <Route path="/admin/items_quantity_report/:id" element={<ItemQuantityReport />} />
                  <Route path="/admin/view_deleted_entry" element={<ViewDeletedEntry />} />
                  <Route path="/admin/notification-permission" element={<NotificationPermission />} />
                  <Route path="/tools/notification-permission" element={<NotificationPermission />} />
                  <Route path="/tools/hard-refresh" element={<HardRefreshPage />} />
                  <Route path="/admin/audit-logs" element={<AuditLogs />} />
                  <Route path="/admin/bill-book" element={<BillBook />} />
                  <Route path="/admin/bank_statement_import" element={<BankStatementImport />} />
                  <Route path="/admin/view_user" element={<ViewUser />} />
                  <Route path="/admin/profile" element={<ProfilePage />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </SettingsProvider>
  );
}

export default App;
