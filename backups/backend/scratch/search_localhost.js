const fs = require('fs');
const path = require('path');

const ROOT_DIR = 'C:\\Users\\Claudio\\Desktop\\Club Newbery';

const ignoreDirs = ['node_modules', '.next', '.git', 'dist', 'backups', 'scratch'];

function walk(dir, results = []) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!ignoreDirs.includes(file)) {
        walk(fullPath, results);
      }
    } else {
      if (file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.yaml') || file.endsWith('.env')) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

function search() {
  const files = walk(ROOT_DIR);
  console.log(`Found ${files.length} code files to scan.`);
  let count = 0;
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const matchesLocalhost = content.match(/localhost/gi);
    const matchesIp = content.match(/127\.0\.0\.1/gi);
    if (matchesLocalhost || matchesIp) {
      count++;
      console.log(`Match in: ${file}`);
      if (matchesLocalhost) console.log(`   localhost occurrences: ${matchesLocalhost.length}`);
      if (matchesIp) console.log(`   127.0.0.1 occurrences: ${matchesIp.length}`);
    }
  });
  console.log(`Scan completed. Found ${count} files with localhost/127.0.0.1 references.`);
}

search();
