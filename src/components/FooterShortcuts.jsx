import React from 'react';

const shortcuts = [
  { key: 'Esc', label: 'Back' },
  { key: 'Ctrl + S', label: 'Sales Invoice' },
  { key: 'F4', label: 'POS' },
  { key: 'Ctrl + P', label: 'Purchase Invoice' },
  { key: 'F1', label: 'Stock Details' },
  { key: 'Ctrl + E', label: 'Expense ledger' },
  { key: 'Ctrl + I', label: 'Income ledger' },
  { key: 'Ctrl + Shift + C', label: 'Customer ledger' },
  { key: 'Ctrl + Shift + M', label: 'Company ledger' },
  { key: 'Alt + C', label: 'Complaint Details' },
  { key: 'Ctrl + M', label: 'Item Master' },
];

export function FooterShortcuts({ isOpen }) {
  return (
    <div className={`hidden md:block fixed bottom-0 right-0 bg-[#2d3238] border-t border-[#1b2024] p-2 z-30 overflow-x-auto custom-scrollbar ${isOpen ? 'left-0 md:left-[220px]' : 'left-0'}`}>
      <div className="flex flex-wrap items-center gap-2 px-2">
        {shortcuts.map((shortcut, index) => (
          <div 
            key={index}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full text-[11px] font-bold text-gray-800 shadow-sm"
          >
            <span>{shortcut.key} - {shortcut.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
