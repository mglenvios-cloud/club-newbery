const fs = require('fs');

const patterns = JSON.parse(fs.readFileSync('C:\\Users\\Claudio\\Desktop\\Club Newbery\\backend\\scratch\\audit_patterns.json', 'utf8'));

console.log("=== LOCALHOST / 127.0.0.1 ===");
patterns['localhost'].concat(patterns['127.0.0.1']).forEach(item => {
  console.log(`- ${item.file} (Line ${item.line}): ${item.content}`);
});

console.log("\n=== TODO / FIXME ===");
patterns['TODO'].concat(patterns['FIXME']).forEach(item => {
  console.log(`- ${item.file} (Line ${item.line}): ${item.content}`);
});

console.log("\n=== MOCK / FAKE / DEMO / SIMULACION / FALLBACK ===");
const mocks = patterns['mock']
  .concat(patterns['fake'])
  .concat(patterns['demo'])
  .concat(patterns['simulacion'])
  .concat(patterns['fallback']);

// Print first 30 mocks
console.log(`Total mock/fake/demo/simulacion/fallback occurrences: ${mocks.length}`);
mocks.slice(0, 30).forEach(item => {
  console.log(`- ${item.file} (Line ${item.line}): ${item.content}`);
});
