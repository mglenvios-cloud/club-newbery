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

function search() {
  console.log("Searching for localhost references in:", srcDir);
  const files = walk(srcDir);
  let matchCount = 0;
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const regex = /(localhost:5000|127\.0\.0\.1|localhost)/gi;
    let match;
    const matchesInFile = [];
    
    // Find line numbers
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.match(regex)) {
        matchesInFile.push({ lineNum: idx + 1, content: line.trim() });
        matchCount++;
      }
    });

    if (matchesInFile.length > 0) {
      console.log(`\nFile: ${path.relative(srcDir, file)}`);
      matchesInFile.forEach(m => {
        console.log(`  Line ${m.lineNum}: ${m.content}`);
      });
    }
  });
  
  console.log(`\nTotal matches found: ${matchCount}`);
}

search();
