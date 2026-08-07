import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/apiClient';

export function PublicBillPage() {
  const { invoiceNo } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const res = await apiClient.get(`/public/bill/${invoiceNo}`);
        if (res.data.success) {
          setInvoice(res.data.data);
        } else {
          setError(res.data.message || 'Bill not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load bill');
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, [invoiceNo]);

  if (loading) {
    return (
      <div style={styles.centeredPage}>
        <div style={{ textAlign: 'center' }}>
          <div style={styles.spinner}></div>
          <p style={{ color: '#6b7280', fontFamily: 'sans-serif', marginTop: 12, fontSize: 14 }}>Loading your bill...</p>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div style={styles.centeredPage}>
        <div style={{ textAlign: 'center', padding: '32px 24px' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>❌</div>
          <h2 style={{ color: '#dc2626', marginBottom: 8, fontSize: 20, fontFamily: 'sans-serif' }}>{error || 'Bill Not Found'}</h2>
          <p style={{ color: '#6b7280', fontSize: 13, fontFamily: 'sans-serif', wordBreak: 'break-all' }}>Invoice: {invoiceNo}</p>
        </div>
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </div>
    );
  }

  const company = invoice.company || {};
  const customer = invoice.customer || {};
  const items = invoice.items || [];
  const subtotal = items.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  const invoiceDate = invoice.date
    ? new Date(invoice.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '-';
  const invoiceTime = invoice.date
    ? new Date(invoice.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div style={styles.pageWrapper}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }
        .bill-card { animation: fadeIn 0.4s ease; }
        .print-btn:hover { background: #4338ca !important; }
        .print-btn:active { transform: scale(0.98); }
        @media print {
          body * { visibility: hidden; }
          .bill-card, .bill-card * { visibility: visible; }
          .bill-card { position: fixed; left: 0; top: 0; width: 100%; animation: none; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="bill-card" style={styles.card}>

        {/* ── Header ── */}
        <div style={styles.header}>
          <h1 style={styles.storeName}>{company.name || 'Bill Receipt'}</h1>
          {company.address && (
            <p style={styles.headerSub}>{company.address}</p>
          )}
          {company.phone && (
            <p style={styles.headerSub}>📞 {company.phone}</p>
          )}
          {company.email && (
            <p style={{ ...styles.headerSub, fontSize: 11 }}>{company.email}</p>
          )}
        </div>

        {/* ── Invoice Meta ── */}
        <div style={styles.metaRow}>
          <div style={styles.metaBox}>
            <span style={styles.metaLabel}>BILL NO</span>
            <span style={styles.metaValue}>{invoice.invoiceNo}</span>
          </div>
          <div style={{ ...styles.metaBox, textAlign: 'right' }}>
            <span style={styles.metaLabel}>DATE &amp; TIME</span>
            <span style={styles.metaValue}>{invoiceDate}</span>
            {invoiceTime && <span style={{ ...styles.metaLabel, marginTop: 1 }}>{invoiceTime}</span>}
          </div>
        </div>

        {/* ── Customer Info ── */}
        {customer.name && (
          <div style={styles.customerBox}>
            <span style={styles.sectionLabel}>CUSTOMER</span>
            <div style={{ fontWeight: 700, color: '#1f2937', fontSize: 14, marginTop: 4 }}>{customer.name}</div>
            {(customer.phone || customer.mobile) && (
              <div style={styles.customerSub}>📞 {customer.phone || customer.mobile}</div>
            )}
            {customer.address && (
              <div style={styles.customerSub}>📍 {customer.address}</div>
            )}
          </div>
        )}

        {/* ── Items ── */}
        <div style={styles.itemsWrapper}>
          {/* Header Row */}
          <div style={styles.itemHeaderRow}>
            <span style={{ flex: 1 }}>ITEM</span>
            <span style={{ width: 40, textAlign: 'center' }}>QTY</span>
            <span style={{ width: 80, textAlign: 'right' }}>AMOUNT</span>
          </div>

          {items.map((item, idx) => (
            <div key={idx} style={styles.itemRow}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={styles.itemName}>{item.product?.name || 'Item'}</div>
                {item.price > 0 && (
                  <div style={styles.itemRate}>@₹{Number(item.price).toFixed(2)}</div>
                )}
              </div>
              <div style={{ width: 40, textAlign: 'center', fontWeight: 700, color: '#374151', fontSize: 13, flexShrink: 0 }}>
                {item.quantity}
              </div>
              <div style={{ width: 80, textAlign: 'right', fontWeight: 700, color: '#1f2937', fontSize: 13, flexShrink: 0 }}>
                ₹{Number(item.amount).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* ── Totals ── */}
        <div style={styles.totalsBox}>
          <div style={styles.totalRow}>
            <span style={{ color: '#6b7280' }}>Subtotal</span>
            <span style={{ color: '#6b7280' }}>₹{subtotal.toFixed(2)}</span>
          </div>
          {invoice.totalDiscount > 0 && (
            <div style={styles.totalRow}>
              <span style={{ color: '#16a34a' }}>Discount</span>
              <span style={{ color: '#16a34a' }}>-₹{Number(invoice.totalDiscount).toFixed(2)}</span>
            </div>
          )}
          <div style={styles.grandTotalRow}>
            <span>TOTAL</span>
            <span>₹{Number(invoice.totalAmount).toFixed(2)}</span>
          </div>
        </div>

        {/* ── Payment Mode ── */}
        {invoice.paymentMode && (
          <div style={styles.paymentRow}>
            <span style={{ color: '#6b7280' }}>Payment Mode</span>
            <span style={{ fontWeight: 700, color: '#1f2937' }}>{invoice.paymentMode}</span>
          </div>
        )}

        {/* ── Footer ── */}
        <div style={styles.footer}>
          <p style={{ margin: 0, fontSize: 13, color: '#4F46E5', fontWeight: 700 }}>*** Thank You For Shopping ***</p>
          <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9ca3af' }}>Visit Again!</p>
        </div>

        {/* ── Print Button ── */}
        <div className="no-print" style={{ padding: '16px' }}>
          <button
            className="print-btn"
            onClick={() => window.print()}
            style={styles.printBtn}
          >
            🖨️ Print This Bill
          </button>
        </div>

      </div>
    </div>
  );
}

const styles = {
  centeredPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f4f6f9',
    padding: '16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '4px solid #4F46E5',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto',
  },
  pageWrapper: {
    minHeight: '100vh',
    background: '#f0f2f5',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '16px 12px 32px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: 480,
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    overflow: 'hidden',
  },
  header: {
    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
    padding: '24px 20px 20px',
    textAlign: 'center',
    color: '#fff',
  },
  storeName: {
    margin: 0,
    fontSize: 'clamp(16px, 5vw, 22px)',
    fontWeight: 800,
    letterSpacing: 0.5,
    lineHeight: 1.2,
    wordBreak: 'break-word',
  },
  headerSub: {
    margin: '4px 0 0',
    fontSize: 12,
    opacity: 0.85,
    lineHeight: 1.4,
    wordBreak: 'break-word',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderBottom: '1px dashed #e5e7eb',
    gap: 8,
  },
  metaBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minWidth: 0,
  },
  metaLabel: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    display: 'block',
  },
  metaValue: {
    fontWeight: 700,
    color: '#1f2937',
    fontSize: 'clamp(11px, 3vw, 14px)',
    wordBreak: 'break-all',
    display: 'block',
  },
  customerBox: {
    padding: '12px 16px',
    borderBottom: '1px dashed #e5e7eb',
    background: '#fafafa',
  },
  sectionLabel: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  customerSub: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 3,
    wordBreak: 'break-word',
  },
  itemsWrapper: {
    padding: '0 16px',
  },
  itemHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 0 8px',
    borderBottom: '2px solid #1f2937',
    fontSize: 11,
    fontWeight: 700,
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 0',
    borderBottom: '1px solid #f3f4f6',
  },
  itemName: {
    fontWeight: 600,
    color: '#1f2937',
    fontSize: 13,
    wordBreak: 'break-word',
    lineHeight: 1.3,
  },
  itemRate: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  totalsBox: {
    padding: '12px 16px',
    borderTop: '1px dashed #e5e7eb',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    marginBottom: 6,
  },
  grandTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 'clamp(16px, 5vw, 20px)',
    fontWeight: 800,
    color: '#4F46E5',
    paddingTop: 10,
    borderTop: '2px solid #4F46E5',
    marginTop: 8,
  },
  paymentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    background: '#f9fafb',
    borderTop: '1px dashed #e5e7eb',
    fontSize: 13,
  },
  footer: {
    padding: '14px 16px 16px',
    textAlign: 'center',
    borderTop: '1px dashed #e5e7eb',
  },
  printBtn: {
    width: '100%',
    background: '#4F46E5',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '14px 0',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: 0.5,
    transition: 'background 0.2s, transform 0.1s',
    WebkitTapHighlightColor: 'transparent',
  },
};
