const fs = require('fs');
const path = require('path');

const ROUTES_DIR = 'C:\\Users\\Claudio\\Desktop\\Club Newbery\\backend\\routes';

const files = fs.readdirSync(ROUTES_DIR).filter(file => file.endsWith('.js'));

const routesReport = [];

files.forEach(file => {
  const filePath = path.join(ROUTES_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const fileReport = {
    file: file,
    routes: []
  };

  lines.forEach((line, idx) => {
    // Search for router definitions e.g., router.get, router.post, router.put, router.delete, router.patch
    const match = line.match(/router\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/);
    if (match) {
      const method = match[1].toUpperCase();
      const path = match[2];
      const hasTry = content.substring(content.indexOf(line)).includes('try');
      const hasAuth = line.includes('authenticateToken') || content.substring(0, content.indexOf(line)).includes('authenticateToken');

      fileReport.routes.push({
        method,
        path,
        line: idx + 1,
        hasTry,
        hasAuth
      });
    }
  });

  routesReport.push(fileReport);
});

const outputPath = 'C:\\Users\\Claudio\\Desktop\\Club Newbery\\backend\\scratch\\backend_routes_audit.json';
fs.writeFileSync(outputPath, JSON.stringify(routesReport, null, 2));
console.log(`Backend routes analysis saved to ${outputPath}`);
