// Custom test runner script to capture output
import { spawn } from 'child_process';
import { writeFileSync } from 'fs';

console.log('Running tests and capturing output...');

const testProcess = spawn('npm', ['test', '--', '--verbose'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true
});

let output = '';
let errorOutput = '';

testProcess.stdout.on('data', (data) => {
  const text = data.toString();
  output += text;
  process.stdout.write(text);
});

testProcess.stderr.on('data', (data) => {
  const text = data.toString();
  errorOutput += text;
  process.stderr.write(text);
});

testProcess.on('close', (code) => {
  console.log(`Test process exited with code ${code}`);
  
  const combinedOutput = `STDOUT:\n${output}\n\nSTDERR:\n${errorOutput}`;
  writeFileSync('test-output.log', combinedOutput);
  
  console.log('Test output written to test-output.log');
});
