const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('c:/Users/Claudio/Desktop/Club Newbery/backend/scratch/audit_patterns.json', 'utf8'));

const summary = {};

const categories = ['mock', 'fake', 'demo', 'fallback', 'simulacion', 'TODO', 'localhost'];

categories.forEach(cat => {
  if (!data[cat]) return;
  data[cat].forEach(item => {
    const file = item.file;
    if (!summary[file]) {
      summary[file] = {};
    }
    if (!summary[file][cat]) {
      summary[file][cat] = [];
    }
    summary[file][cat].push(item.line);
  });
});

console.log('=== PATTERNS BY FILE ===');
Object.keys(summary).sort().forEach(file => {
  const cats = Object.keys(summary[file]).map(cat => `${cat}: ${summary[file][cat].length} lines (${summary[file][cat].join(', ')})`).join(' | ');
  console.log(`- ${file}: ${cats}`);
});
