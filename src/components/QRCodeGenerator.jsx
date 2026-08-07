import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export function QRCodeGenerator({ amount, merchantName, billId, paymentUrl, upiId }) {
  // Determine the QR code value based on provided props
  let qrValue = paymentUrl || '';

  // If no paymentUrl is provided but upiId is, construct a UPI intent URI
  if (!qrValue && upiId) {
    const params = new URLSearchParams();
    params.append('pa', upiId);
    if (merchantName) params.append('pn', merchantName);
    if (amount) params.append('am', amount.toString());
    if (billId) params.append('tr', billId);
    
    qrValue = `upi://pay?${params.toString()}`;
  }

  // Fallback if no data is provided
  if (!qrValue) {
    qrValue = 'NO_PAYMENT_INFO_PROVIDED';
  }

  return (
    <div className="flex justify-center items-center">
      <QRCodeSVG
        value={qrValue}
        size={120}
        level="H"
        includeMargin={true}
      />
    </div>
  );
}
