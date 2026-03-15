module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  collectCoverageFrom: [
    'overlord-dashboard/realdebrid_controller.js',
    'overlord-dashboard/dashboard/js/**/*.js',
    '!overlord-dashboard/dashboard/js/*.min.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.js$': 'babel-jest'
  },
  moduleDirectories: ['node_modules', 'overlord-dashboard/dashboard/js'],
  moduleFileExtensions: ['js', 'jsx', 'json'],
  transformIgnorePatterns: ['node_modules/(?!@testing-library/)'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
};
