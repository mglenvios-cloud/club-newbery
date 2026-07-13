const fs = require('fs');
const path = require('path');

const logFile = 'C:\\Users\\Claudio\\.gemini\\antigravity\\brain\\3ac2ccc9-9135-4ce1-b970-bfd78c6a83aa\\.system_generated\\logs\\transcript_full.jsonl';

function read() {
  const lines = fs.readFileSync(logFile, 'utf8').split('\n');
  lines.forEach((line) => {
    if (!line) return;
    try {
      const obj = JSON.parse(line);
      if (line.includes('admin/login/page.js') && obj.tool_calls) {
        obj.tool_calls.forEach(tc => {
          if (tc.name === 'replace_file_content' || tc.name === 'write_to_file' || tc.name === 'multi_replace_file_content') {
            console.log(`Step ${obj.step_index}: ${tc.name}`);
            console.log("Arguments TargetContent / ReplacementContent preview:");
            if (tc.arguments.TargetContent) {
              console.log("Target:", tc.arguments.TargetContent.substring(0, 150));
            }
            if (tc.arguments.ReplacementContent) {
              console.log("Replacement:", tc.arguments.ReplacementContent.substring(0, 150));
            }
            console.log("=========================================");
          }
        });
      }
    } catch {}
  });
}

read();
