const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../..');

function walk(dir, results = []) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.next' || file === '.git' || file === '.vercel') return;
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      walk(fullPath, results);
    } else {
      if (file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.yml') || file.endsWith('.yaml') || file.endsWith('.md')) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

function search() {
  console.log("Searching for production URLs...");
  const files = walk(rootDir);
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const regex = /(https?:\/\/[^\s'"]+)/g;
    const matches = content.match(regex);
    if (matches) {
      matches.forEach(m => {
        if (!m.includes('localhost') && !m.includes('127.0.0.1') && !m.includes('github.com') && !m.includes('vercel.app') && !m.includes('nextjs.org') && !m.includes('npmjs.com') && !m.includes('react.dev') && !m.includes('lucide.dev') && !m.includes('tailwindcss.com')) {
          console.log(`File: ${path.relative(rootDir, file)} -> ${m}`);
        }
      });
    }
  });
}

search();
