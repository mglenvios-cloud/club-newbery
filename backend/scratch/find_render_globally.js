const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\Claudio\\Desktop';

function walk(currentDir) {
  try {
    const list = fs.readdirSync(currentDir);
    list.forEach(file => {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
          walk(fullPath);
        }
      } else {
        if (file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.env') || file.endsWith('.txt') || file.endsWith('.md')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('onrender.com')) {
              console.log(`Found in: ${fullPath}`);
              // print lines
              const lines = content.split('\n');
              lines.forEach((line, idx) => {
                if (line.includes('onrender.com')) {
                  console.log(`  Line ${idx + 1}: ${line.trim()}`);
                }
              });
            }
          } catch {}
        }
      }
    });
  } catch {}
}

walk(dir);
console.log("Search completed.");
