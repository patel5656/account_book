const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedFiles = 0;
walk('./src', (filePath) => {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;

    // Add flex-wrap to all <div className="flex items-center gap-X"> containers
    newContent = newContent.replace(/<div className="([^"]*)\bflex items-center gap-([\d.]+)\b([^"]*)"/g, (match, p1, p2, p3) => {
      if (p1.includes('flex-wrap') || p3.includes('flex-wrap')) return match;
      let cleanP1 = p1 ? p1.trim() + ' ' : '';
      let cleanP3 = p3 ? ' ' + p3.trim() : '';
      return `<div className="${cleanP1}flex flex-wrap items-center gap-${p2}${cleanP3}"`;
    });

    // Specific fixes for StockPriceUpdate.jsx header
    if (filePath.includes('StockPriceUpdate.jsx')) {
      newContent = newContent.replace(
        /className="bg-\[#1a9fbd\] px-4 py-\[6px\] flex justify-between items-center text-white"/g,
        'className="bg-[#1a9fbd] px-4 py-[6px] flex flex-wrap justify-between items-center gap-2 text-white"'
      );
      // Ensure the search bar takes full width on mobile
      newContent = newContent.replace(
        /className="w-\[300px\] min-w-0 border border-gray-300 rounded-\[3px\]/g,
        'className="w-full sm:w-[300px] min-w-0 border border-gray-300 rounded-[3px]'
      );
    }

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      modifiedFiles++;
    }
  }
});
console.log('Modified', modifiedFiles, 'files.');
