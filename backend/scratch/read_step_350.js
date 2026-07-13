const fs = require('fs');
const path = require('path');

const logFile = 'C:\\Users\\Claudio\\.gemini\\antigravity\\brain\\3ac2ccc9-9135-4ce1-b970-bfd78c6a83aa\\.system_generated\\logs\\transcript_full.jsonl';

function read() {
  const lines = fs.readFileSync(logFile, 'utf8').split('\n');
  lines.forEach((line) => {
    if (!line) return;
    try {
      const obj = JSON.parse(line);
      if (obj.step_index === 350) {
        console.log(JSON.stringify(obj, null, 2));
      }
    } catch {}
  });
}

read();
