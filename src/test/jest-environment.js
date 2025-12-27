// jest-environment.js
export default async function setup() {
  process.env.NODE_ENV = 'test';
  console.log('Environment setup completed!');
}
