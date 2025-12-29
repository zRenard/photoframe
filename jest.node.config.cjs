/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest']
  },
  testMatch: [
    '**/src/test/super-basic.test.js'
  ],
  testTimeout: 5000,
  verbose: true,
  setupFilesAfterEnv: []
};
