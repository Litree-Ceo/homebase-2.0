# Scan Push System - Everything HomeBase 2.0

## Overview

The Scan Push System is a comprehensive automation tool designed for Everything HomeBase 2.0. It provides powerful scanning, pushing, installation, and update capabilities with advanced features like Honeycomb Vision Drip Layout Mode and Cursor integration.

## Features

### 🐝 Honeycomb Vision Drip Layout Mode
- Real-time visual feedback with hexagonal grid patterns
- Animated drip effects with customizable intensity
- Black, Purple, Gold, Yellow color scheme
- Status indicators and scan lines

### 🎯 Cursor Top-Level Integration
- Automatic Cursor configuration detection
- Seamless integration with Cursor IDE
- Persistent configuration storage
- Free tier access enabled

### 🔄 Scan and Push Functionality
- Comprehensive environment scanning
- Automatic package installation and updates
- Configuration file processing
- Directory manifest generation

### 🎨 Color Scheme: Black, Purple, Gold, Yellow
- Themed terminal output
- Visual consistency across all components
- Professional and distinctive appearance

## Installation

The Scan Push System is automatically included in Everything HomeBase 2.0. To use it:

### Via npm/pnpm
```bash
# Run scan push with free tier
pnpm run scan:push:free

# Run scan push with pro tier
pnpm run scan:push:pro

# Run scan push with default settings
pnpm run scan:push
```

### Via Node.js
```bash
# JavaScript version
node scripts/scan-push-system.js

# With free tier
node scripts/scan-push-system.js --free

# With pro tier
node scripts/scan-push-system.js --pro
```

### Via PowerShell
```powershell
# PowerShell version
.\scripts\scan-push-system.ps1

# With free tier
.\scripts\scan-push-system.ps1 -Free

# With pro tier
.\scripts\scan-push-system.ps1 -Pro
```

## Usage

### Basic Usage
```bash
# Scan and push everything
pnpm run scan:push

# Scan with free tier access
pnpm run scan:push:free

# Scan with pro tier access
pnpm run scan:push:pro
```

### Advanced Usage
```bash
# JavaScript version with options
node scripts/scan-push-system.js --free

# PowerShell version with options
.\scripts\scan-push-system.ps1 -Free
```

## Command Line Options

### JavaScript Version
- `--free`: Enable free tier mode
- `--pro`: Enable pro tier mode

### PowerShell Version
- `-Free`: Enable free tier mode
- `-Pro`: Enable pro tier mode

## What It Does

### 1. Environment Scanning
- Scans all apps, packages, and scripts directories
- Identifies package.json files for dependency management
- Detects configuration files (tsconfig.json, eslint, prettier)
- Checks for Cursor IDE integration

### 2. Package Management
- Runs `pnpm install` for all detected packages
- Executes `pnpm update` to keep dependencies current
- Updates package.json with scan push scripts
- Creates scan push manifests for each directory

### 3. Configuration Updates
- Updates TypeScript configurations with path mappings
- Adds scan push scripts to package.json
- Configures Cursor integration settings
- Creates persistent configuration files

### 4. Visual Feedback
- Displays Honeycomb Vision Drip Layout Mode
- Shows real-time scan progress
- Provides status indicators and completion messages
- Uses themed color output (Black, Purple, Gold, Yellow)

## Directory Structure

```
scripts/
├── scan-push-system.js      # Main JavaScript implementation
├── scan-push-system.ps1     # PowerShell version for Windows
└── scan-push-system.ts      # TypeScript version (if needed)

apps/
└── honey-comb-home/
    └── components/
        └── honeycomb-vision/
            ├── HoneycombVision.tsx      # React component
            └── HoneycombVision.module.css  # Styling

docs/
└── SCAN_PUSH_SYSTEM.md      # This documentation
```

## Integration with Honeycomb Vision

The system includes a React component that provides real-time visual feedback:

```tsx
import HoneycombVision from '@/components/honeycomb-vision/HoneycombVision';

function MyComponent() {
  return (
    <HoneycombVision 
      enabled={true} 
      intensity={1} 
      colorScheme="black-purple-gold-yellow" 
    />
  );
}
```

## Cursor Integration

The system automatically detects and configures Cursor IDE integration:

1. **Detection**: Checks for `.cursor` directory in user home
2. **Configuration**: Creates `homebase-config.json` with settings
3. **Persistence**: Stores scan history and preferences
4. **Integration**: Enables seamless workflow with Cursor

## Free Tier vs Pro Tier

### Free Tier
- Basic scanning and pushing functionality
- Standard package updates
- Limited concurrent operations
- Basic visual feedback

### Pro Tier
- Advanced scanning algorithms
- Parallel package processing
- Enhanced visual effects
- Priority support and updates

## Troubleshooting

### Common Issues

1. **Permission Errors**
   ```bash
   # Fix file permissions
   chmod +x scripts/scan-push-system.js
   chmod +x scripts/scan-push-system.ps1
   ```

2. **pnpm Not Found**
   ```bash
   # Install pnpm globally
   npm install -g pnpm
   ```

3. **Cursor Integration Issues**
   ```bash
   # Manually create Cursor directory
   mkdir ~/.cursor
   ```

### Logs and Debugging

The system provides detailed logging:
- Real-time progress updates
- Error reporting with context
- Completion summaries
- Visual status indicators

## Development

### Adding New Features

1. **Extend Scan Functionality**
   ```javascript
   // In scan-push-system.js
   async scanNewFeature() {
     // Implementation
   }
   ```

2. **Add New Color Schemes**
   ```javascript
   // In HoneycombVision.tsx
   const colorSchemes = {
     'neon': ['#ff0055', '#00ff55', '#5500ff'],
     // Add more schemes
   };
   ```

3. **Enhance Visual Effects**
   ```css
   /* In HoneycombVision.module.css */
   .custom-effect {
     animation: custom-animation 2s infinite;
   }
   ```

### Testing

```bash
# Test JavaScript version
node scripts/scan-push-system.js --free

# Test PowerShell version
.\scripts\scan-push-system.ps1 -Free

# Test with verbose output
DEBUG=true node scripts/scan-push-system.js
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the troubleshooting section
- Review the logs for error details
- Submit issues on GitHub
- Join our community discussions

## Changelog

### v2.0.0
- Initial release of Scan Push System
- Honeycomb Vision Drip Layout Mode
- Cursor integration
- Free and Pro tier support
- Cross-platform compatibility (JavaScript + PowerShell)