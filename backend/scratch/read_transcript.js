const fs = require('fs');
const path = require('path');

const logFile = 'C:\\Users\\Claudio\\.gemini\\antigravity\\brain\\3ac2ccc9-9135-4ce1-b970-bfd78c6a83aa\\.system_generated\\logs\\transcript.jsonl';

function read() {
  if (!fs.existsSync(logFile)) {
    console.log("Log file not found.");
    return;
  }
  const lines = fs.readFileSync(logFile, 'utf8').split('\n');
  lines.forEach((line, idx) => {
    if (!line) return;
    try {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        obj.tool_calls.forEach(tc => {
          if (tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content' || tc.name === 'write_to_file') {
            console.log(`Step ${obj.step_index}: Tool: ${tc.name}`);
            console.log(`Arguments:`, JSON.stringify(tc.arguments, null, 2));
            console.log("------------------------------------------------");
          }
        });
      }
    } catch (e) {
      // console.log(`Error parsing line ${idx}:`, e.message);
    }
  });
}

read();
