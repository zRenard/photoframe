#!/usr/bin/env node
import { spawn } from 'child_process';
// import { promises as _fs } from 'fs';
// import _path from 'path';

// Test files that we've fixed
const testFiles = [
  'src/components/__tests__/CalendarPopin.test.jsx',
  'src/components/__tests__/CalendarPopin.simplified.test.jsx',
  'src/test/basic.test.jsx',
];

// Function to run a single test
async function runTest(file) {
  console.log(`\n======= Testing: ${file} =======\n`);
  
  return new Promise((resolve) => {
    const testProcess = spawn('npx', ['jest', file, '--verbose', '--config=jest.config.cjs'], {
      stdio: 'inherit',
      shell: true
    });
    
    testProcess.on('close', (code) => {
      console.log(`\n======= Test ${file} completed with exit code ${code} =======\n`);
      resolve(code);
    });
  });
}

// Run all tests sequentially
async function runAllTests() {
  let allPassed = true;
  
  for (const file of testFiles) {
    const exitCode = await runTest(file);
    if (exitCode !== 0) {
      allPassed = false;
      console.error(`Test failed for ${file}`);
    }
  }
  
  if (allPassed) {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } else {
    console.error('\n❌ Some tests failed!');
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Error running tests:', err);
  process.exit(1);
});
