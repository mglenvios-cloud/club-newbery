const fs = require('fs');
const path = require('path');

const ROOT_DIR = 'C:\\Users\\Claudio\\Desktop\\Club Newbery';
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');

const ignoreDirs = ['node_modules', '.next', '.git', 'dist', 'backups', 'scratch'];

// Helper to walk directory
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!ignoreDirs.includes(file)) {
        results = results.concat(walk(fullPath));
      }
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

const allFiles = walk(ROOT_DIR);
console.log(`Total files found: ${allFiles.length}`);

// Phase 5 Scan: Search for localhost, 127.0.0.1, TODO, FIXME, mock, fake, demo, admin/admin, futsal/futsal, fallback, simulación
const searchTerms = [
  { term: 'localhost', regex: /localhost/gi },
  { term: '127.0.0.1', regex: /127\.0\.0\.1/gi },
  { term: 'TODO', regex: /TODO/g },
  { term: 'FIXME', regex: /FIXME/g },
  { term: 'mock', regex: /mock/gi },
  { term: 'fake', regex: /fake/gi },
  { term: 'demo', regex: /demo/gi },
  { term: 'admin/admin', regex: /admin\s*\/\s*admin/gi },
  { term: 'futsal/futsal', regex: /futsal\s*\/\s*futsal/gi },
  { term: 'fallback', regex: /fallback/gi },
  { term: 'simulacion', regex: /simula/gi }
];

const scanResults = {};
searchTerms.forEach(item => {
  scanResults[item.term] = [];
});

allFiles.forEach(file => {
  if (file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.env') || file.endsWith('.prisma')) {
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      return;
    }
    const relPath = path.relative(ROOT_DIR, file).replace(/\\/g, '/');
    
    searchTerms.forEach(item => {
      const matches = content.match(item.regex);
      if (matches) {
        // Find line numbers
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.match(item.regex)) {
            scanResults[item.term].push({
              file: relPath,
              line: idx + 1,
              content: line.trim().substring(0, 100)
            });
          }
        });
      }
    });
  }
});

// Output results to a JSON file
const reportPath = path.join(BACKEND_DIR, 'scratch', 'audit_patterns.json');
fs.writeFileSync(reportPath, JSON.stringify(scanResults, null, 2));
console.log(`Pattern scan saved to ${reportPath}`);
