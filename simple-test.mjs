#!/usr/bin/env node

// Simple test runner to check basic functionality
console.log('Starting simple test runner...');

try {
  // Test 1: Basic arithmetic
  console.log('Test 1: Basic arithmetic');
  if (2 + 2 === 4) {
    console.log('✓ Basic arithmetic test passed');
  } else {
    console.log('✗ Basic arithmetic test failed');
  }

  // Test 2: Constants import
  console.log('Test 2: Constants import');
  try {
    const constants = await import('./src/utils/constants.js');
    if (constants.POSITIONS && Array.isArray(constants.POSITIONS)) {
      console.log('✓ Constants import test passed');
    } else {
      console.log('✗ Constants import test failed - POSITIONS not found or not array');
    }
  } catch (error) {
    console.log('✗ Constants import test failed:', error.message);
  }

  console.log('Simple test runner completed');
} catch (error) {
  console.error('Test runner error:', error);
}
