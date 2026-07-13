const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../../frontend/src');

function walk(dir, results = []) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        walk(fullPath, results);
      }
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.css')) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

function refactor() {
  console.log("Refactoring files in:", srcDir);
  const files = walk(srcDir);
  let changedFilesCount = 0;
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. Replace parenthesized: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') -> process.env.NEXT_PUBLIC_API_URL
    const parenthesizedRegex = /\(process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*['"]http:\/\/localhost:5000['"]\)/g;
    content = content.replace(parenthesizedRegex, 'process.env.NEXT_PUBLIC_API_URL');

    // 2. Replace non-parenthesized: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000' -> process.env.NEXT_PUBLIC_API_URL
    const rawRegex = /process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*['"]http:\/\/localhost:5000['"]/g;
    content = content.replace(rawRegex, 'process.env.NEXT_PUBLIC_API_URL');

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Refactored: ${path.relative(srcDir, file)}`);
      changedFilesCount++;
    }
  });
  
  console.log(`\nTotal files refactored: ${changedFilesCount}`);
}

refactor();
