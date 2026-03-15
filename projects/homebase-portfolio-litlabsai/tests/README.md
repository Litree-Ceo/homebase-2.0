# HomeBase Testing Framework

This directory contains a comprehensive testing suite for the HomeBase portfolio website.

## Available Test Scripts

- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:browser` - Run browser compatibility tests
- `npm run test:responsive` - Run responsive design tests
- `npm run test:performance` - Run performance tests
- `npm run test:accessibility` - Run accessibility tests
- `npm run test:preview` - Run automated preview generation
- `npm run test:ci` - Run continuous integration tests
- `npm run test:all` - Run all test suites

## Test Categories

### 1. Browser Compatibility Tests
Tests ensure the website works across different browsers and supports modern web standards.

### 2. Responsive Design Tests
Validates the website's layout and functionality across various screen sizes and devices.

### 3. Performance Tests
Measures loading times, memory usage, and component efficiency.

### 4. Accessibility Tests
Ensures the website meets accessibility standards and is usable by all users.

### 5. Automated Preview Generation
Creates visual previews of the website across different devices and generates reports.

### 6. Continuous Integration Tests
Validates build processes, code quality, and security.

## Running Tests

1. Navigate to the tests directory:
   ```bash
   cd tests
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the desired test suite:
   ```bash
   npm run test:browser
   ```

## Test Reports

Test results and coverage reports are generated in the `tests/coverage` directory. Preview reports are saved in the `tests/screenshots` directory.