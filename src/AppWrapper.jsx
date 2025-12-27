import React from 'react';
import ModularApp from './ModularApp';

// Wrapper component that can be used to switch between old and new implementations
function AppWrapper() {
  // For now, use the optimized modular app
  // You can switch back to the original App by changing this line
  return <ModularApp />;
}

export default AppWrapper;
