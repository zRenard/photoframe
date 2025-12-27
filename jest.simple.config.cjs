/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub'
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest']
  },
  testMatch: [
    '**/src/test/*.test.js',
    '**/src/utils/**/*.test.js',
    '**/src/services/**/*.test.js',
    '**/src/components/**/*.test.jsx'
  ],
  testTimeout: 5000,
  verbose: true,
  setupFilesAfterEnv: []
};
