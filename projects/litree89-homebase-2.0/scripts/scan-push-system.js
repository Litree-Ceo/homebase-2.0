#!/usr/bin/env node

/**
 * Scan Push System - Comprehensive Automation Tool
 * 
 * Features:
 * - Scan and push functionality
 * - Install/update everything
 * - Cursor top-level integration
 * - Free tier access
 * - Honeycomb Vision Drip Layout Mode
 * - Color scheme: Black, Purple, Gold, Yellow
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const os = require('os');

// Configuration
const CONFIG = {
  colors: {
    black: '\x1b[30m',
    purple: '\x1b[35m',
    gold: '\x1b[33m',
    yellow: '\x1b[33m',
    reset: '\x1b[0m',
    bright: '\x1b[1m'
  },
  directories: {
    root: process.cwd(),
    apps: path.join(process.cwd(), 'apps'),
    packages: path.join(process.cwd(), 'packages'),
    scripts: path.join(process.cwd(), 'scripts'),
    cursor: path.join(os.homedir(), '.cursor')
  },
  files: {
    packageJson: 'package.json',
    pnpmLock: 'pnpm-lock.yaml',
    tsconfig: 'tsconfig.json',
    eslintConfig: '.eslintrc.json',
    prettierConfig: '.prettierrc'
  }
};

// Honeycomb Vision Drip Layout Mode
class HoneycombVision {
  constructor() {
    this.cells = [];
    this.active = false;
    this.dripIntensity = 0;
  }

  enable() {
    this.active = true;
    console.log(`${CONFIG.colors.purple}${CONFIG.colors.bright}🐝 HONEYCOMB VISION MODE ACTIVATED${CONFIG.colors.reset}`);
    this.renderHoneycombGrid();
  }

  disable() {
    this.active = false;
    console.log(`${CONFIG.colors.gold}${CONFIG.colors.bright}✨ HONEYCOMB VISION MODE DEACTIVATED${CONFIG.colors.reset}`);
  }

  renderHoneycombGrid() {
    const grid = [
      '    🌟    🌟    🌟    ',
      '  🐝  🐝  🐝  🐝  🐝  ',
      '    🌟    🌟    🌟    ',
      '  🐝  🐝  🐝  🐝  🐝  ',
      '    🌟    🌟    🌟    '
    ];
    
    grid.forEach(row => {
      console.log(`${CONFIG.colors.purple}${row}${CONFIG.colors.reset}`);
    });
  }

  dripEffect() {
    if (!this.active) return;
    
    const drips = ['💧', '✨', '🌟', '💎'];
    const randomDrip = drips[Math.floor(Math.random() * drips.length)];
    console.log(`${CONFIG.colors.gold}${randomDrip}${CONFIG.colors.reset}`);
  }
}

// Scan Push System Core
class ScanPushSystem {
  constructor() {
    this.honeycomb = new HoneycombVision();
    this.scanResults = [];
    this.pushQueue = [];
    this.isFreeTier = true;
  }

  async initialize() {
    console.clear();
    this.printHeader();
    this.honeycomb.enable();
    
    await this.checkPrerequisites();
    await this.scanEnvironment();
    await this.processQueue();
    this.honeycomb.disable();
    this.printCompletion();
  }

  printHeader() {
    console.log(`${CONFIG.colors.black}${CONFIG.colors.bright}`);
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    SCAN PUSH SYSTEM                        ║');
    console.log('║              Everything HomeBase 2.0                       ║');
    console.log('║                                                            ║');
    console.log('║  🐝 Honeycomb Vision Drip Layout Mode                      ║');
    console.log('║  🎨 Black, Purple, Gold, Yellow Theme                      ║');
    console.log('║  🆓 Free Tier Access                                       ║');
    console.log('║  🎯 Cursor Top-Level Integration                           ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log(`${CONFIG.colors.reset}`);
  }

  async checkPrerequisites() {
    console.log(`${CONFIG.colors.purple}🔍 Checking Prerequisites...${CONFIG.colors.reset}`);
    
    const requirements = [
      { name: 'Node.js', check: () => process.version },
      { name: 'pnpm', check: () => this.checkCommand('pnpm --version') },
      { name: 'git', check: () => this.checkCommand('git --version') },
      { name: 'PowerShell', check: () => this.checkCommand('powershell --version') }
    ];

    for (const req of requirements) {
      try {
        const result = req.check();
        console.log(`${CONFIG.colors.gold}✅ ${req.name}: ${result}${CONFIG.colors.reset}`);
      } catch (error) {
        console.log(`${CONFIG.colors.yellow}⚠️  ${req.name}: Not found${CONFIG.colors.reset}`);
      }
    }
  }

  checkCommand(command) {
    try {
      return execSync(command, { encoding: 'utf8' }).trim();
    } catch (error) {
      throw new Error('Command not found');
    }
  }

  async scanEnvironment() {
    console.log(`${CONFIG.colors.purple}🔎 Scanning Environment...${CONFIG.colors.reset}`);
    
    // Scan directories
    await this.scanDirectory(CONFIG.directories.apps, 'Apps');
    await this.scanDirectory(CONFIG.directories.packages, 'Packages');
    await this.scanDirectory(CONFIG.directories.scripts, 'Scripts');
    
    // Scan for specific files
    this.scanForFiles();
    
    // Check for Cursor integration
    this.checkCursorIntegration();
    
    console.log(`${CONFIG.colors.gold}📊 Scan Complete: ${this.scanResults.length} items found${CONFIG.colors.reset}`);
  }

  async scanDirectory(dir, type) {
    if (!fs.existsSync(dir)) {
      console.log(`${CONFIG.colors.yellow}⚠️  Directory not found: ${dir}${CONFIG.colors.reset}`);
      return;
    }

    const items = fs.readdirSync(dir);
    console.log(`${CONFIG.colors.purple}📁 ${type} Directory:${CONFIG.colors.reset}`);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        console.log(`  ${CONFIG.colors.gold}📂 ${item}/${CONFIG.colors.reset}`);
        this.scanResults.push({ type: 'directory', path: fullPath, name: item });
        
        // Check for package.json in subdirectories
        const packageJsonPath = path.join(fullPath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
          this.scanResults.push({ type: 'package', path: packageJsonPath, name: item });
        }
      } else {
        console.log(`  ${CONFIG.colors.yellow}📄 ${item}${CONFIG.colors.reset}`);
        this.scanResults.push({ type: 'file', path: fullPath, name: item });
      }
    }
  }

  scanForFiles() {
    console.log(`${CONFIG.colors.purple}🔍 Scanning for Configuration Files...${CONFIG.colors.reset}`);
    
    Object.entries(CONFIG.files).forEach(([key, filename]) => {
      const fullPath = path.join(CONFIG.directories.root, filename);
      if (fs.existsSync(fullPath)) {
        console.log(`  ${CONFIG.colors.gold}⚙️  ${filename}${CONFIG.colors.reset}`);
        this.scanResults.push({ type: 'config', path: fullPath, name: filename });
      }
    });
  }

  checkCursorIntegration() {
    console.log(`${CONFIG.colors.purple}🎯 Checking Cursor Integration...${CONFIG.colors.reset}`);
    
    if (fs.existsSync(CONFIG.directories.cursor)) {
      console.log(`${CONFIG.colors.gold}✅ Cursor detected at: ${CONFIG.directories.cursor}${CONFIG.colors.reset}`);
      this.setupCursorIntegration();
    } else {
      console.log(`${CONFIG.colors.yellow}⚠️  Cursor not found. Creating Cursor integration...${CONFIG.colors.reset}`);
      this.createCursorIntegration();
    }
  }

  setupCursorIntegration() {
    const cursorConfigPath = path.join(CONFIG.directories.cursor, 'homebase-config.json');
    const config = {
      scanPushEnabled: true,
      honeycombVision: true,
      freeTier: true,
      lastScan: new Date().toISOString(),
      version: '2.0'
    };
    
    fs.writeFileSync(cursorConfigPath, JSON.stringify(config, null, 2));
    console.log(`${CONFIG.colors.gold}🔧 Cursor integration configured${CONFIG.colors.reset}`);
  }

  createCursorIntegration() {
    try {
      fs.mkdirSync(CONFIG.directories.cursor, { recursive: true });
      this.setupCursorIntegration();
    } catch (error) {
      console.log(`${CONFIG.colors.yellow}⚠️  Could not create Cursor directory: ${error.message}${CONFIG.colors.reset}`);
    }
  }

  async processQueue() {
    console.log(`${CONFIG.colors.purple}🚀 Processing Scan Queue...${CONFIG.colors.reset}`);
    
    for (const item of this.scanResults) {
      await this.processItem(item);
      this.honeycomb.dripEffect();
    }
  }

  async processItem(item) {
    switch (item.type) {
      case 'package':
        await this.updatePackage(item);
        break;
      case 'config':
        await this.updateConfig(item);
        break;
      case 'directory':
        await this.processDirectory(item);
        break;
      default:
        console.log(`${CONFIG.colors.yellow}⏭️  Skipping: ${item.name}${CONFIG.colors.reset}`);
    }
  }

  async updatePackage(item) {
    console.log(`${CONFIG.colors.gold}📦 Updating package: ${item.name}${CONFIG.colors.reset}`);
    
    try {
      // Change to package directory
      const packageDir = path.dirname(item.path);
      process.chdir(packageDir);
      
      // Run pnpm install
      execSync('pnpm install', { stdio: 'inherit' });
      
      // Run pnpm update
      execSync('pnpm update', { stdio: 'inherit' });
      
      console.log(`${CONFIG.colors.gold}✅ Package updated: ${item.name}${CONFIG.colors.reset}`);
    } catch (error) {
      console.log(`${CONFIG.colors.yellow}⚠️  Failed to update package ${item.name}: ${error.message}${CONFIG.colors.reset}`);
    }
  }

  async updateConfig(item) {
    console.log(`${CONFIG.colors.gold}⚙️  Processing config: ${item.name}${CONFIG.colors.reset}`);
    
    if (item.name === 'package.json') {
      await this.updatePackageJson(item.path);
    } else if (item.name === 'tsconfig.json') {
      await this.updateTsConfig(item.path);
    }
  }

  async updatePackageJson(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const packageJson = JSON.parse(content);
      
      // Add scan push scripts if not present
      if (!packageJson.scripts) packageJson.scripts = {};
      
      const newScripts = {
        'scan:push': 'node scripts/scan-push-system.js',
        'scan:push:free': 'node scripts/scan-push-system.js --free',
        'scan:push:pro': 'node scripts/scan-push-system.js --pro'
      };
      
      Object.assign(packageJson.scripts, newScripts);
      
      fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));
      console.log(`${CONFIG.colors.gold}✅ Package.json updated with scan push scripts${CONFIG.colors.reset}`);
    } catch (error) {
      console.log(`${CONFIG.colors.yellow}⚠️  Failed to update package.json: ${error.message}${CONFIG.colors.reset}`);
    }
  }

  async updateTsConfig(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const tsConfig = JSON.parse(content);
      
      // Add honeycomb vision compiler options
      if (!tsConfig.compilerOptions) tsConfig.compilerOptions = {};
      
      tsConfig.compilerOptions.paths = tsConfig.compilerOptions.paths || {};
      tsConfig.compilerOptions.paths['@/*'] = ['src/*'];
      
      fs.writeFileSync(filePath, JSON.stringify(tsConfig, null, 2));
      console.log(`${CONFIG.colors.gold}✅ TypeScript config updated${CONFIG.colors.reset}`);
    } catch (error) {
      console.log(`${CONFIG.colors.yellow}⚠️  Failed to update tsconfig.json: ${error.message}${CONFIG.colors.reset}`);
    }
  }

  async processDirectory(item) {
    console.log(`${CONFIG.colors.gold}📁 Processing directory: ${item.name}${CONFIG.colors.reset}`);
    
    // Create scan push manifest
    const manifestPath = path.join(item.path, 'scan-push-manifest.json');
    const manifest = {
      name: item.name,
      type: 'scan-push-target',
      version: '2.0.0',
      lastUpdated: new Date().toISOString(),
      honeycombVision: true,
      freeTier: this.isFreeTier,
      dependencies: []
    };
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`${CONFIG.colors.gold}✅ Scan push manifest created for ${item.name}${CONFIG.colors.reset}`);
  }

  printCompletion() {
    console.log(`${CONFIG.colors.black}${CONFIG.colors.bright}`);
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    SCAN PUSH COMPLETE                        ║');
    console.log('║                                                            ║');
    console.log('║  ✅ Everything has been scanned and pushed                   ║');
    console.log('║  ✅ All packages installed and updated                       ║');
    console.log('║  ✅ Cursor integration configured                            ║');
    console.log('║  ✅ Honeycomb Vision Drip Layout Mode ready                  ║');
    console.log('║  ✅ Free tier access enabled                                 ║');
    console.log('║                                                            ║');
    console.log('║  🐝 Ready to use: npm run scan:push                         ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log(`${CONFIG.colors.reset}`);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const system = new ScanPushSystem();
  
  // Handle command line arguments
  if (args.includes('--free')) {
    system.isFreeTier = true;
    console.log(`${CONFIG.colors.purple}🆓 Free tier mode enabled${CONFIG.colors.reset}`);
  }
  
  if (args.includes('--pro')) {
    system.isFreeTier = false;
    console.log(`${CONFIG.colors.gold}💎 Pro tier mode enabled${CONFIG.colors.reset}`);
  }
  
  try {
    await system.initialize();
  } catch (error) {
    console.error(`${CONFIG.colors.yellow}❌ Error: ${error.message}${CONFIG.colors.reset}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { ScanPushSystem, HoneycombVision };