import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useGlobalShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input (except for modifiers or function keys if needed)
      const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);

      // Esc -> Go Back
      if (e.key === 'Escape') {
        // Only navigate back if we aren't typing in an input field 
        // to avoid conflicting with input-clearing or modal-closing behavior
        if (!isInputFocused) {
          e.preventDefault();
          navigate(-1);
        }
      }
      // Ctrl + S -> Credit Invoice (Sales Invoice)
      if (e.ctrlKey && e.key.toLowerCase() === 's' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        navigate('/admin/sales-invoice');
      }
      
      // F4 -> Cash Invoice (POS)
      if (e.key === 'F4') {
        e.preventDefault();
        navigate('/admin/pos');
      }

      // Ctrl + P -> Purchase Invoice
      if (e.ctrlKey && e.key.toLowerCase() === 'p' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        navigate('/admin/create_invoices/company_purchase');
      }

      // F1 -> Stock Details
      if (e.key === 'F1') {
        e.preventDefault();
        navigate('/admin/stock-details');
      }

      // Ctrl + E -> Expense ledger
      if (e.ctrlKey && e.key.toLowerCase() === 'e' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        navigate('/admin/expenses-ledger/expense_ledger');
      }

      // Ctrl + I -> Income ledger
      if (e.ctrlKey && e.key.toLowerCase() === 'i' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        navigate('/admin/incomes-ledger/income_ledger');
      }

      // Ctrl + Shift + C -> Customer ledger
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c' && !e.altKey) {
        e.preventDefault();
        navigate('/admin/party-ledger/customer_payment');
      }

      // Ctrl + Shift + M -> Company ledger
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'm' && !e.altKey) {
        e.preventDefault();
        navigate('/admin/party-ledger/company_payment');
      }

      // Alt + C -> Complaint Details
      if (e.altKey && e.key.toLowerCase() === 'c' && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        navigate('/admin/complaint_details');
      }

      // Ctrl + M -> Item Master
      if (e.ctrlKey && e.key.toLowerCase() === 'm' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        navigate('/admin/item_master');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
}
