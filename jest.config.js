/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  // The test environment that will be used for testing
  testEnvironment: "jsdom",
  
  // A map from regular expressions to module names or to arrays of module names
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    "\\.(css|less|scss|sass)$": "<rootDir>/src/test/styleMock.js",
    
    // Handle image imports and other files
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/src/test/fileMock.js"
  },

  // Transform files with babel-jest
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { rootMode: "upward" }]
  },
  
  // Files to treat as ESM (since we're using "type": "module" in package.json)
  extensionsToTreatAsEsm: [".jsx", ".ts", ".tsx"],
  
  // File extensions to include
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  
  // Setup files to run after the environment is set up
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.js"],
  
  // Indicates whether the coverage information should be collected
  collectCoverage: false,
  
  // An array of glob patterns indicating a set of files for which coverage should be collected
  collectCoverageFrom: ["src/**/*.{js,jsx}", "!src/main.jsx", "!**/node_modules/**"],
  
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",
  
  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",
  
  // Various other settings
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  
  // Verbose output
  verbose: true
};
