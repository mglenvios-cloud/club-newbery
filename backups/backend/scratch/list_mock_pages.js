const fs = require('fs');
const path = require('path');

const ROOT_DIR = 'C:\\Users\\Claudio\\Desktop\\Club Newbery';
const ignoreDirs = ['node_modules', '.next', '.git', 'dist', 'backups', 'scratch'];

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
      if (file.endsWith('.js')) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const files = walk(ROOT_DIR);
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(ROOT_DIR, file).replace(/\\/g, '/');
  if (content.includes('defaultMock') || content.includes('mockData')) {
    console.log(`- ${relPath}`);
  }
});
