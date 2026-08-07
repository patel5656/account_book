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
walk('./src/pages', (filePath) => {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;

    // Remove min-w-[XXXpx] from div and table containers (like min-w-[800px], min-w-[1000px])
    newContent = newContent.replace(/min-w-\[\d+px\]/g, 'w-full');

    // Change max-w-[XXXpx] on form inputs to allow full width on mobile
    // e.g., w-full max-w-[250px] -> w-full sm:max-w-[250px]
    newContent = newContent.replace(/w-full max-w-\[(\d+px)\]/g, 'w-full sm:max-w-[$1]');

    // Fix the case where the wrapper is just `<div className="min-w-[800px]">`
    // which becomes `<div className="w-full">` which is perfectly fine.

    // Also fix tables to ensure they have responsive scrolling if content is too large
    // We can add overflow-x-auto to the container if not present, but it's already there in most cases.
    // However, if we removed min-w, the table won't overflow unless its content forces it.
    // To ensure tables don't squish too much, we can add `whitespace-nowrap` to table headers
    newContent = newContent.replace(/<th className="([^"]*)"/g, (match, p1) => {
      if (!p1.includes('whitespace-nowrap')) {
        return `<th className="${p1} whitespace-nowrap"`;
      }
      return match;
    });

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      modifiedFiles++;
    }
  }
});

walk('./src/components', (filePath) => {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;

    newContent = newContent.replace(/min-w-\[\d+px\]/g, 'w-full');
    newContent = newContent.replace(/w-full max-w-\[(\d+px)\]/g, 'w-full sm:max-w-[$1]');

    newContent = newContent.replace(/<th className="([^"]*)"/g, (match, p1) => {
      if (!p1.includes('whitespace-nowrap')) {
        return `<th className="${p1} whitespace-nowrap"`;
      }
      return match;
    });

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      modifiedFiles++;
    }
  }
});
console.log('Modified', modifiedFiles, 'files.');
