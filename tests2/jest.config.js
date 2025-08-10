// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.ts'],
  coverageReporters: ['text', 'html'],
  coverageDirectory: 'coverage',
};
