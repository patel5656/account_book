import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportToExcel = async (workbookName, sheets) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Swayam Bill Book';
  workbook.created = new Date();

  // Define border style
  const thinBorder = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  let validSheetsAdded = 0;

  sheets.forEach((sheetDef) => {
    // 5. Skip empty worksheets automatically
    if (!sheetDef.data || sheetDef.data.length === 0) return;

    validSheetsAdded++;
    const worksheet = workbook.addWorksheet(sheetDef.sheetName);

    // Get max columns
    const numCols = sheetDef.headers.length;
    
    // Calculate ending letter for Title Merge (A-Z, AA-ZZ)
    let endChar = '';
    if (numCols <= 26) {
      endChar = String.fromCharCode(64 + numCols);
    } else {
      endChar = String.fromCharCode(64 + Math.floor(numCols / 26)) + String.fromCharCode(64 + (numCols % 26));
    }

    // 4. Display a proper title at the top
    worksheet.mergeCells(`A1:${endChar}1`);
    const titleCell = worksheet.getCell('A1');
    titleCell.value = sheetDef.title;
    titleCell.font = { name: 'Arial', size: 14, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.border = thinBorder;
    
    // Add empty row for spacing
    worksheet.addRow([]);

    // 4. Include column headers with bold formatting
    const headerRow = worksheet.addRow(sheetDef.headers.map(h => h.label));
    headerRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true, name: 'Arial', size: 11 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' } // Light gray background
      };
      cell.border = thinBorder;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      
      // 4. Auto-adjust column widths based on content (fallback to estimated width based on header length)
      const column = worksheet.getColumn(colNumber);
      const headerLength = sheetDef.headers[colNumber - 1].label.length;
      column.width = sheetDef.headers[colNumber - 1].width || Math.max(15, headerLength + 5);
    });

    // 4. Freeze the header row (Rows 1-3)
    worksheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: 3 }
    ];

    // Data Rows
    sheetDef.data.forEach((rowData) => {
      const row = worksheet.addRow(
        sheetDef.headers.map(h => {
          let val = rowData[h.key];
          // 4. Display blank values as "-" instead of null
          if (val === null || val === undefined || val === '') return '-';
          return val;
        })
      );
      
      row.eachCell((cell, colNumber) => {
        const headerType = sheetDef.headers[colNumber - 1].type;
        
        // 4. Apply borders to all data cells
        cell.border = thinBorder;
        cell.font = { name: 'Arial', size: 10 };
        
        if (cell.value === '-') {
           cell.alignment = { horizontal: 'center', vertical: 'middle' };
           return;
        }

        if (headerType === 'number' || headerType === 'currency') {
          // 4. Right-align numeric values
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          
          if (typeof cell.value === 'number') {
            // 5. Preserve decimal precision
            if (headerType === 'currency') {
               cell.numFmt = '₹#,##0.00';
            } else {
               // Normal number formatting
               cell.numFmt = '#,##0.##';
            }
          } else if (!isNaN(parseFloat(cell.value))) {
             // Convert string numbers to float for Excel processing
             cell.value = parseFloat(cell.value);
             if (headerType === 'currency') cell.numFmt = '₹#,##0.00';
             else cell.numFmt = '#,##0.##';
          }
        } else {
          // 4. Left-align text values
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
        }
      });
    });
  });

  if (validSheetsAdded === 0) {
    throw new Error('No data available to export based on current filters.');
  }

  // 5. Workbook name should include the report name and current date
  const buffer = await workbook.xlsx.writeBuffer();
  const dateStr = new Date().toISOString().split('T')[0];
  saveAs(new Blob([buffer]), `${workbookName}_${dateStr}.xlsx`);
};
