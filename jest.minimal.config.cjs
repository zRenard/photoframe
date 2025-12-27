/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/test/styleMock.cjs',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/test/fileMock.cjs'
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest']
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.js'],
  testMatch: [
    '**/src/test/**/*.test.js',
    '**/src/utils/**/*.test.js',
    '**/src/hooks/**/*.test.js',
    '**/src/services/**/*.test.js',
    '**/src/components/**/*.test.jsx'
  ],
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  testTimeout: 30000,
  verbose: true,
  maxWorkers: 1,
  forceExit: true
};
