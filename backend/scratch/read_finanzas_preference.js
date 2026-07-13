const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\Claudio\\Desktop\\Club Newbery\\backend\\routes\\finanzas.js', 'utf8');

const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('Preference') || line.includes('back_urls') || line.includes('mercadopago')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
