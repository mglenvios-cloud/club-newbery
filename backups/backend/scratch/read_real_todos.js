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
      if (file.endsWith('.js') || file.endsWith('.prisma') || file.endsWith('.env')) {
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
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('// TODO') || line.includes('// FIXME') || line.includes('/* TODO') || line.includes('/* FIXME')) {
      console.log(`- ${relPath} (Line ${idx + 1}): ${line.trim()}`);
    }
  });
});
