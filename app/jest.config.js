module.exports = {
  preset: 'jest-expo',
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],
  setupFiles: ['./jest.setup.js'],
};
