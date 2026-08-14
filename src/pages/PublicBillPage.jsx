import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { Template1 } from './PrintTemplates';
import { Printer } from 'lucide-react';

export function PublicBillPage() {
  const { invoiceNo } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allPrintSettings, setAllPrintSettings] = useState(null);
  const printRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const billRes = await apiClient.get(`/public/bill/${invoiceNo}`);
        if (billRes.data.success) {
          setInvoice(billRes.data.data);
        } else {
          setError(billRes.data.message || 'Bill not found');
          setLoading(false);
          return;
        }

        try {
          // Attempt to fetch settings, this might fail if not authenticated, but we'll try
          const settingsRes = await apiClient.get('/settings');
          if (settingsRes.data?.success && settingsRes.data?.data?.printSettings) {
            setAllPrintSettings(settingsRes.data.data.printSettings);
          }
        } catch (setErr) {
          console.warn("Could not fetch custom print settings, using defaults.", setErr);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load bill');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [invoiceNo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-3 text-sm">Loading your invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-sm w-full">
          <div className="text-5xl mb-3">❌</div>
          <h2 className="text-red-600 mb-2 text-xl font-bold">{error || 'Bill Not Found'}</h2>
          <p className="text-gray-500 text-sm break-all">Invoice: {invoiceNo}</p>
        </div>
      </div>
    );
  }

  // Determine transaction type based on invoice number prefix or data
  // Default to Income Transaction for sales
  let transactionType2 = 'Income Transaction';
  if (invoiceNo.startsWith('PO') || invoiceNo.startsWith('PI')) {
      transactionType2 = 'Expense Transaction';
  }

  const currentConfig = allPrintSettings?.[transactionType2] || {};
  
  // Default settings if not configured
  const headerSettings = currentConfig.headerSettings || {
      showLogo: true, showMobileNumber: true, showEmail: true, showQrCode: true,
      labelGstin: 'GSTIN', labelInvoiceNumber: 'Invoice Number', labelDate: 'Date',
      labelCustomer: 'Customer', labelAddress: 'Address', labelPartyContact: 'Contact Number',
      labelPartyPan: 'Pan Number', labelPartyGstin: 'GSTIN',
      partyContactNumber: true, partyPanNumber: true, partyGstin: true,
      customFields: [], showMrp: true, showPrimaryQty: true, showSecondaryQty: true,
      showDiscount1: true, showDiscount2: true, showDiscount: true, showUnit: true,
      showCompanyProductCode: true, showBatchNo: true, showHsn: true, showPurchasePrice: true
  };
  
  const tableSettings = currentConfig.tableSettings || {
      thItemName: '', thHsnSac: '', showThHsnSac: true, thGst: '', showThGst: true,
      thQty: '', showThQty: true, thRate: '', showThRate: true, thDiscount: '', showThDiscount: true,
      thTaxableValue: '', showThTaxableValue: true, thTotalAmount: '', showThTotalAmount: true,
      tlIgst: '', showTlIgst: true, tlCgst: '', showTlCgst: true, tlSgst: '', showTlSgst: true,
      tlCess: '', showTlCess: true, tlTcs: '', showTlTcs: true, tlRoundOff: '', showTlRoundOff: true
  };
  
  const footerSettings = currentConfig.footerSettings || {
      showQrCode: true, showHsnSummary: false, showCurrentOutstanding: false,
      outstandingPosition: 'After this Transaction', showPaymentDetails: true,
      labelTermsAndConditions: 'Terms And Conditions', labelThankYouNote: 'Thank You Note'
  };
  
  const customization = currentConfig.customization || {
      headerCompanyNameB: true, headerCompanyNameU: true, headerCompanyNameFontSize: '24',
      headerCompanyAddressFontSize: '13', headerLabelsFontSize: '11', headerContentsFontSize: '11',
      tableHeadingsFontSize: '11', tableContentsFontSize: '11', tableFooterFontSize: '11',
      pageMargin: '0', primaryColor: '#4d1685'
  };

  const company = invoice.company || {};
  const customer = invoice.customer || {};
  const items = invoice.items || [];
  
  const invoiceDate = invoice.date
    ? new Date(invoice.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '-';

  // Map to previewInvoice format expected by Template1
  const mappedPreviewInvoice = {
      companyName: company.name || '',
      companyAddress: company.address || '',
      companyPhone: company.phone || company.mobile || '',
      companyEmail: company.email || '',
      companyGst: company.gstin || company.gst || '',
      companyLogo: company.logoUrl || company.logo || '',
      
      customerName: customer.name || '',
      customerAddress: customer.address || '',
      customerPhone: customer.phone || customer.mobile || '',
      customerEmail: customer.email || '',
      customerGst: customer.gstin || customer.gst || '',
      customerPan: customer.pan || '',
      
      shippingName: invoice.shippingName || customer.name || '',
      shippingAddress: invoice.shippingAddress || customer.address || '',
      shippingPhone: invoice.shippingPhone || customer.phone || customer.mobile || '',
      shippingGst: invoice.shippingGst || customer.gstin || customer.gst || '',
      
      invoiceNumber: invoice.invoiceNo || '',
      invoiceDate: invoiceDate,
      deliveryChallanNo: invoice.deliveryChallanNo || '',
      deliveryDate: invoice.deliveryDate ? new Date(invoice.deliveryDate).toLocaleDateString() : '',
      
      ackNo: invoice.ackNo || '',
      ackDate: invoice.ackDate || '',
      irn: invoice.irn || '',
      
      transportName: invoice.transportName || '',
      documentNo: invoice.documentNo || '',
      documentDate: invoice.documentDate || '',
      
      poNo: invoice.poNo || '',
      poDate: invoice.poDate || '',
      
      ewayBillNo: invoice.ewayBillNo || '',
      ewayBillDate: invoice.ewayBillDate || '',
      vehicleNo: invoice.vehicleNo || '',
      
      customField1: invoice.customField1 || '',
      customField2: invoice.customField2 || '',
      customField3: invoice.customField3 || '',
      
      totalInWords: invoice.totalInWords || '',
      paymentDetails: invoice.paymentDetails || '',
      terms: invoice.termsAndConditions || '',
      notes: invoice.notes || '',
      signatureUrl: company.signatureUrl || company.signature || '',
      
      bankDetails: {
          bankName: allPrintSettings?.bankDetails?.bankName || company.bankName || '',
          ifscCode: allPrintSettings?.bankDetails?.ifscCode || company.ifscCode || '',
          accountNumber: allPrintSettings?.bankDetails?.accountNumber || company.accountNumber || '',
          branchName: allPrintSettings?.bankDetails?.branchName || company.branchName || '',
          accountName: allPrintSettings?.bankDetails?.bankAccountName || company.accountName || ''
      },
      upiId: allPrintSettings?.bankDetails?.upiId || company.upiId || '',
      
      totalIgst: invoice.totalIgst || 0,
      totalGstAmount: invoice.totalGstAmount || 0,
      roundOff: invoice.roundOff || 0
  };

  const parsedItems = items.map(i => ({
      name: i.product?.name || i.name || 'Unknown',
      productCode: i.productCode || i.product?.code || i.product?.sku || i.product?.barcode || '-',
      batchNo: i.batchNo || i.product?.batchNo || '-',
      quantity: i.quantity || 1,
      freeQty: i.freeQty || 0,
      price: i.price || 0,
      purchasePrice: i.purchasePrice || i.product?.purchasePrice || 0,
      mrp: i.mrp || i.product?.mrp || 0,
      pcs: i.quantity || 1,
      secQty: i.secOpeningQty || i.secQty || '-',
      priQty: i.primaryOpeningQty || i.priQty || i.quantity || '-',
      unit: i.unit || i.sUnit || i.pUnit || i.product?.baseUnit || '-',
      size: i.size || i.product?.size || '-',
      pcsRate: i.price || 0,
      discount: i.discount1 || i.disc1 || 0,
      discount2: i.discount2 || i.disc2 || 0,
      totalDiscount: (i.discount1 || i.disc1 || 0) + (i.discount2 || i.disc2 || 0),
      hsn: i.hsnCode || i.product?.hsnCode || '-',
      taxableValue: i.amount || 0,
      total: i.total || i.amount || 0,
      taxPercent: i.taxRate || i.gstRate || i.product?.tax || 0
  }));

  let totalQty = 0;
  let totalTaxable = 0;
  let totalFinal = 0;
  parsedItems.forEach(i => {
      totalQty += Number(i.quantity);
      totalTaxable += Number(i.taxableValue);
      totalFinal += Number(i.total);
  });
  
  // Apply document level discount if any
  if (invoice.totalDiscount) {
     totalFinal -= Number(invoice.totalDiscount);
  }

  const qrCodeUrl = allPrintSettings?.bankDetails?.upiId ? 
      `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${allPrintSettings.bankDetails.upiId}&pn=${encodeURIComponent(allPrintSettings.bankDetails.bankAccountName || company.name || '')}&am=${totalFinal}` : 
      '';

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center py-8">
      <style>{`
        @media print {
          body { background-color: white !important; margin: 0 !important; padding: 0 !important; }
          .no-print { display: none !important; }
          .print-container { box-shadow: none !important; margin: 0 !important; border: none !important; width: 100% !important; max-width: none !important; padding: 0 !important; }
          @page { margin: 0; }
        }
      `}</style>
      
      <div className="no-print w-full max-w-[210mm] mb-4 flex justify-between items-center px-4">
          <h2 className="text-xl font-bold text-gray-800">Invoice Preview</h2>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors"
          >
            <Printer className="w-5 h-5" />
            Print Document
          </button>
      </div>

      <div ref={printRef} className="print-container bg-white shadow-xl max-w-[210mm] w-full mx-auto" style={{ padding: customization.pageMargin + 'px' }}>
         <Template1 
            previewInvoice={mappedPreviewInvoice}
            parsedItems={parsedItems}
            totalQty={totalQty}
            totalTaxable={totalTaxable.toFixed(2)}
            totalFinal={totalFinal.toFixed(2)}
            qrCodeUrl={qrCodeUrl}
            allPrintSettings={allPrintSettings}
            headerSettings={headerSettings}
            tableSettings={tableSettings}
            footerSettings={footerSettings}
            customization={customization}
            transactionType="General Template"
            transactionType2={transactionType2}
         />
      </div>
    </div>
  );
}
