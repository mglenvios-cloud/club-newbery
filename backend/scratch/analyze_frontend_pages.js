const fs = require('fs');
const path = require('path');

const FRONTEND_APP_DIR = 'C:\\Users\\Claudio\\Desktop\\Club Newbery\\frontend\\src\\app';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!['node_modules', '.next', '.git'].includes(file)) {
        results = results.concat(walk(fullPath));
      }
    } else {
      if (file === 'page.js') {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const pageFiles = walk(FRONTEND_APP_DIR);
const pagesReport = [];

pageFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(FRONTEND_APP_DIR, file).replace(/\\/g, '/');
  const lines = content.split('\n');

  const pageInfo = {
    route: relPath.replace('/page.js', '').replace('page.js', '/'),
    file: relPath,
    fetches: [],
    buttons: [],
    hasHydrationWarning: content.includes('suppressHydrationWarning'),
    useEffectsCount: (content.match(/useEffect/g) || []).length,
    useStatesCount: (content.match(/useState/g) || []).length
  };

  lines.forEach((line, idx) => {
    // Search for fetch calls
    const fetchMatch = line.match(/fetch\(\s*['"`]([^'`"]+)['"`]/);
    if (fetchMatch) {
      pageInfo.fetches.push({
        line: idx + 1,
        url: fetchMatch[1].trim()
      });
    }

    // Search for buttons
    if (line.includes('<button') || line.includes('onClick')) {
      pageInfo.buttons.push({
        line: idx + 1,
        content: line.trim().substring(0, 120)
      });
    }
  });

  pagesReport.push(pageInfo);
});

const outputPath = 'C:\\Users\\Claudio\\Desktop\\Club Newbery\\backend\\scratch\\frontend_pages_audit.json';
fs.writeFileSync(outputPath, JSON.stringify(pagesReport, null, 2));
console.log(`Frontend pages analysis saved to ${outputPath}`);
