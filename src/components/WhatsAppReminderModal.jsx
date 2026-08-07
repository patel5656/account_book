import React, { useState } from 'react';
import { X, MessageCircle, Copy, Check } from 'lucide-react';

const TEMPLATES = [
  {
    id: 1,
    label: 'Payment Due Reminder',
    getMessage: (d) =>
      `Dear ${d.customerName},\n\nThis is a gentle reminder that your payment of ₹${d.amount} is pending against Invoice #${d.invoiceNo}.\n\nDue Date: ${d.dueDate}\nPending Balance: ₹${d.balance}\n\nKindly make the payment at the earliest.\n\nThank You,\n${d.companyName}\n${d.contact}`,
  },
  {
    id: 2,
    label: 'Overdue Payment Alert',
    getMessage: (d) =>
      `Dear ${d.customerName},\n\nYour payment of ₹${d.amount} against Invoice #${d.invoiceNo} is OVERDUE.\n\nPlease clear your outstanding balance of ₹${d.balance} immediately to avoid any inconvenience.\n\n${d.companyName} | ${d.contact}`,
  },
  {
    id: 3,
    label: 'Friendly Reminder',
    getMessage: (d) =>
      `Hi ${d.customerName},\n\nHope you are doing well!\n\nWe wanted to remind you about an outstanding payment of ₹${d.balance} (Invoice #${d.invoiceNo}).\n\nPlease let us know if you need any assistance.\n\nWarm Regards,\n${d.companyName}`,
  },
];

export function WhatsAppReminderModal({ isOpen, onClose, customer }) {
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [copied, setCopied] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  if (!isOpen || !customer) return null;

  const data = {
    customerName: customer.name || 'Customer',
    invoiceNo: customer.invoiceNo || 'N/A',
    amount: customer.dueAmount || '0',
    dueDate: customer.dueDate || 'N/A',
    balance: customer.balance || '0',
    companyName: 'Swayam Bill Book',

    contact: '+91-XXXXXXXXXX',
  };

  const message = isCustom
    ? customMessage
    : TEMPLATES[selectedTemplate].getMessage(data);

  const mobileNo = customer.mobile || '';
  const isValidMobile = /^[6-9]\d{9}$/.test(mobileNo.replace(/\D/g, ''));

  const waLink = `https://wa.me/91${mobileNo.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(message).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSend = () => {
    if (!isValidMobile) {
      alert('Invalid mobile number. Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    window.open(waLink, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[3px] shadow-2xl w-full max-w-[min(98vw,650px)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh]">

        {/* Header */}
        <div className="bg-[#4F46E5] flex items-center justify-between flex-shrink-0">
          <h2 className="text-[15px] text-white font-bold tracking-wide pl-4 py-2.5 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" strokeWidth={2.5} />
            WhatsApp Reminder
          </h2>
          <button onClick={onClose} className="bg-[#dc3545] hover:bg-[#c82333] h-full px-3 py-2.5 focus:outline-none transition-colors">
            <X className="w-5 h-5 text-white" strokeWidth={3} />
          </button>
        </div>

        {/* Customer Info Strip */}
        <div className="bg-[#f0fdf4] border-b border-green-100 px-4 py-2 flex flex-wrap gap-4 flex-shrink-0">
          <div className="text-[13px]">
            <span className="text-gray-500">Customer: </span>
            <span className="font-bold text-gray-800">{data.customerName}</span>
          </div>
          <div className="text-[13px]">
            <span className="text-gray-500">Invoice #: </span>
            <span className="font-bold text-gray-800">{data.invoiceNo}</span>
          </div>
          <div className="text-[13px]">
            <span className="text-gray-500">Due Amount: </span>
            <span className="font-bold text-red-600">₹{data.amount}</span>
          </div>
          <div className="text-[13px]">
            <span className="text-gray-500">Mobile: </span>
            <span className={`font-bold ${isValidMobile ? 'text-green-700' : 'text-red-600'}`}>
              {mobileNo || 'Not Available'}
              {!isValidMobile && mobileNo && <span className="ml-1 text-[11px]">(Invalid)</span>}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1">

          {/* Template Selector */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold text-gray-800">Message Template</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-[12px] text-gray-600">Custom Message</span>
                <div
                  className={`w-[32px] h-[16px] rounded-full relative transition-colors ${isCustom ? 'bg-[#4F46E5]' : 'bg-gray-300'}`}
                  onClick={() => setIsCustom(!isCustom)}
                >
                  <div className={`w-[12px] h-[12px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${isCustom ? 'translate-x-[18px]' : 'translate-x-[2px]'}`}></div>
                </div>
              </label>
            </div>

            {!isCustom && (
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(i)}
                    className={`px-3 py-1.5 rounded-[3px] text-[12px] font-bold border transition-colors ${
                      selectedTemplate === i
                        ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#4F46E5]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message Preview / Editor */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold text-gray-800">
                {isCustom ? 'Write Your Message' : 'Message Preview'}
              </label>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-800 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {isCustom ? (
              <textarea
                rows={8}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Type your custom WhatsApp message here..."
                className="border border-gray-300 rounded-[3px] px-3 py-2 text-[13px] outline-none focus:border-[#4F46E5] resize-none bg-white text-gray-800 font-mono leading-relaxed"
              />
            ) : (
              <div className="bg-[#dcf8c6] border border-green-200 rounded-[3px] px-3 py-3 text-[13px] text-gray-800 whitespace-pre-wrap font-mono leading-relaxed min-h-[180px]">
                {message}
              </div>
            )}
          </div>

          {/* Validation Warning */}
          {!isValidMobile && (
            <div className="bg-red-50 border border-red-200 rounded-[3px] px-3 py-2 text-[12px] text-red-700 font-medium">
              ⚠️ This customer does not have a valid 10-digit mobile number. WhatsApp cannot be sent.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#f8f9fa] px-4 py-3 flex justify-between items-center gap-2 border-t border-gray-200 flex-shrink-0">
          <span className="text-[12px] text-gray-500">
            {isValidMobile ? `Sending to: +91 ${mobileNo}` : 'No valid mobile number'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-[7px] rounded-[3px] text-[13px] font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!isValidMobile}
              className={`flex items-center gap-2 px-5 py-[7px] rounded-[3px] text-[13px] font-bold transition-colors shadow-sm ${
                isValidMobile
                  ? 'bg-[#4F46E5] hover:bg-[#4338ca] text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <MessageCircle className="w-4 h-4" strokeWidth={2.5} />
              Send on WhatsApp
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
