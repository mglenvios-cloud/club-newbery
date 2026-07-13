const fs = require('fs');
const path = require('path');

const APP_DIR = 'C:\\Users\\Claudio\\Desktop\\Club Newbery\\frontend\\src\\app';

function walk(dir, results = []) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      walk(fullPath, results);
    } else {
      if (file === 'page.js' || file === 'layout.js' || file === 'route.js') {
        results.push(fullPath);
      }
    }
  });
  return results;
}

function scan() {
  const files = walk(APP_DIR);
  console.log(`Found ${files.length} route files:`);
  files.forEach(file => {
    const rel = path.relative(APP_DIR, file).replace(/\\/g, '/');
    console.log(`- ${rel}`);
  });
}

scan();
