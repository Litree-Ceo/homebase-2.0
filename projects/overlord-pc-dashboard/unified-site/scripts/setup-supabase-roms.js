#!/usr/bin/env node
/**
 * Supabase ROM Storage Setup Script (Node.js version)
 * Creates 'roms' bucket and uploads sample ROM files for EmulatorJS
 * 
 * Usage:
 *   node setup-supabase-roms.js --url https://your-project.supabase.co --key your-anon-key
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Parse arguments
const args = process.argv.slice(2);
const getArg = (flag) => {
  const index = args.indexOf(flag);
  return index !== -1 ? args[index + 1] : null;
};

const supabaseUrl = getArg('--url');
const supabaseKey = getArg('--key');
const demoMode = args.includes('--demo');

if (!demoMode && (!supabaseUrl || !supabaseKey)) {
  console.log(`
🎮 LiTree Labs Arcade - ROM Storage Setup

Usage:
  node setup-supabase-roms.js --url https://your-project.supabase.co --key your-anon-key
  
Options:
  --url    Supabase project URL
  --key    Supabase anon/public key
  --demo   Create local demo files only (no upload)

Example:
  node setup-supabase-roms.js --url https://abc123.supabase.co --key eyJhbG...
`);
  process.exit(1);
}

// Sample ROM metadata
const SAMPLE_ROMS = [
  {
    name: "Super Mario Bros (USA).nes",
    console: "nes",
    filename: "super_mario_bros.nes",
    size_kb: 40,
    description: "NES Platformer",
    icon: "🍄"
  },
  {
    name: "The Legend of Zelda (USA).nes",
    console: "nes",
    filename: "legend_of_zelda.nes",
    size_kb: 128,
    description: "NES Action-Adventure",
    icon: "🗡️"
  },
  {
    name: "Super Mario World (USA).snes",
    console: "snes",
    filename: "super_mario_world.smc",
    size_kb: 512,
    description: "SNES Platformer",
    icon: "🦖"
  },
  {
    name: "Zelda - Link to the Past (USA).snes",
    console: "snes",
    filename: "zelda_link_past.smc",
    size_kb: 1024,
    description: "SNES Action-Adventure",
    icon: "🏹"
  },
  {
    name: "Sonic the Hedgehog (USA).gen",
    console: "genesis",
    filename: "sonic.md",
    size_kb: 512,
    description: "Genesis Platformer",
    icon: "💨"
  },
  {
    name: "Streets of Rage 2 (USA).gen",
    console: "genesis",
    filename: "streets_rage_2.md",
    size_kb: 1024,
    description: "Genesis Beat 'em up",
    icon: "👊"
  },
  {
    name: "Super Mario Advance (USA).gba",
    console: "gba",
    filename: "mario_advance.gba",
    size_kb: 4096,
    description: "GBA Platformer",
    icon: "🍄"
  },
  {
    name: "Metroid Fusion (USA).gba",
    console: "gba",
    filename: "metroid_fusion.gba",
    size_kb: 8192,
    description: "GBA Action-Adventure",
    icon: "👾"
  }
];

function createSampleROM(outputDir, romInfo) {
  const filePath = path.join(outputDir, romInfo.filename);
  
  // Create dummy ROM data based on console type
  let header;
  switch(romInfo.console) {
    case 'nes':
      header = Buffer.from('NES\x1a\x02\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00');
      break;
    case 'snes':
      header = Buffer.alloc(512);
      break;
    case 'genesis':
      header = Buffer.from('SEGA GENESIS    ');
      break;
    case 'gba':
      header = Buffer.alloc(192);
      break;
    default:
      header = Buffer.alloc(0);
  }
  
  const data = Buffer.alloc(romInfo.size_kb * 1024);
  header.copy(data);
  
  fs.writeFileSync(filePath, data);
  return filePath;
}

async function setupSupabaseStorage(url, key) {
  console.log(`🔗 Connecting to Supabase: ${url}`);
  const supabase = createClient(url, key);
  
  const bucketName = 'roms';
  console.log(`\n📦 Creating bucket: ${bucketName}`);
  
  try {
    await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 10485760 // 10MB
    });
    console.log(`✅ Bucket '${bucketName}' created`);
  } catch (e) {
    if (e.message?.includes('already exists')) {
      console.log(`ℹ️  Bucket '${bucketName}' already exists`);
    } else {
      console.log(`⚠️  Bucket warning: ${e.message}`);
    }
  }
  
  // Create ROMs directory
  const romsDir = path.join(__dirname, '..', 'roms');
  if (!fs.existsSync(romsDir)) {
    fs.mkdirSync(romsDir, { recursive: true });
  }
  console.log(`\n📁 ROM directory: ${romsDir}`);
  
  const uploadedROMs = [];
  
  for (const rom of SAMPLE_ROMS) {
    console.log(`\n🎮 Processing: ${rom.name}`);
    
    // Create local file
    const filePath = createSampleROM(romsDir, rom);
    console.log(`   Created: ${rom.filename} (${rom.size_kb} KB)`);
    
    // Upload to Supabase
    const storagePath = `${rom.console}/${rom.filename}`;
    
    try {
      const fileBuffer = fs.readFileSync(filePath);
      
      await supabase.storage.from(bucketName).upload(storagePath, fileBuffer, {
        contentType: 'application/octet-stream',
        upsert: true
      });
      
      const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
      
      uploadedROMs.push({
        ...rom,
        storagePath,
        publicUrl,
        uploaded: true
      });
      
      console.log(`   ✅ Uploaded: ${storagePath}`);
      console.log(`   🔗 URL: ${publicUrl}`);
      
    } catch (e) {
      console.log(`   ❌ Failed: ${e.message}`);
      uploadedROMs.push({
        ...rom,
        storagePath,
        publicUrl: null,
        uploaded: false,
        error: e.message
      });
    }
  }
  
  generateROMConfig(uploadedROMs);
  return uploadedROMs;
}

function generateROMConfig(roms) {
  const configPath = path.join(__dirname, '..', 'static', 'js', 'rom-config.js');
  
  const romEntries = roms
    .filter(r => r.uploaded)
    .map(rom => {
      const gameId = rom.filename.replace(/\./g, '_').replace(/-/g, '_');
      return `    ${gameId}: {
        name: "${rom.name}",
        console: "${rom.console}",
        url: "${rom.publicUrl}",
        size: ${rom.size_kb},
        description: "${rom.description}",
        icon: "${rom.icon}"
    }`;
    }).join(',\n');
  
  const jsContent = `// Auto-generated ROM configuration
// Generated by setup-supabase-roms.js

const SUPABASE_ROMS = {
${romEntries}
};

// Console core mapping for EmulatorJS
const CONSOLE_CORES = {
    'nes': 'nes',
    'snes': 'snes', 
    'genesis': 'segaMD',
    'gba': 'gba'
};

async function loadROMFromSupabase(gameId) {
    const rom = SUPABASE_ROMS[gameId];
    if (!rom) {
        console.error('ROM not found:', gameId);
        return null;
    }
    
    try {
        const response = await fetch(rom.url);
        if (!response.ok) throw new Error('Failed to fetch ROM');
        const arrayBuffer = await response.arrayBuffer();
        return {
            data: arrayBuffer,
            console: rom.console,
            name: rom.name
        };
    } catch (err) {
        console.error('Failed to load ROM:', err);
        return null;
    }
}

// Auto-load ROM when clicking game cards
async function playROM(gameId) {
    const rom = await loadROMFromSupabase(gameId);
    if (!rom) {
        alert('Failed to load ROM. Make sure you have the legal right to play this game.');
        return;
    }
    
    // Start EmulatorJS with the loaded ROM
    if (window.startEmulator) {
        window.startEmulator(rom.data, rom.console, rom.name);
    } else {
        console.log('Emulator not initialized. ROM loaded:', rom.name);
    }
}
`;
  
  fs.writeFileSync(configPath, jsContent);
  console.log(`\n📝 Generated: ${configPath}`);
}

async function main() {
  console.log('='.repeat(60));
  console.log('🎮 LiTree Labs Arcade - ROM Storage Setup');
  console.log('='.repeat(60));
  
  if (demoMode) {
    console.log('\n📁 DEMO MODE: Creating local ROM files only\n');
    
    const romsDir = path.join(__dirname, '..', 'roms');
    if (!fs.existsSync(romsDir)) {
      fs.mkdirSync(romsDir, { recursive: true });
    }
    
    for (const rom of SAMPLE_ROMS) {
      createSampleROM(romsDir, rom);
      console.log(`✅ Created: ${rom.filename} (${rom.size_kb} KB)`);
    }
    
    console.log(`\n📁 ROMs saved to: ${romsDir}`);
    console.log('\n⚠️  IMPORTANT: Replace these placeholder files with your own legally dumped ROMs!');
    return;
  }
  
  // Full setup
  const roms = await setupSupabaseStorage(supabaseUrl, supabaseKey);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  
  const uploaded = roms.filter(r => r.uploaded).length;
  const failed = roms.length - uploaded;
  
  console.log(`Total ROMs: ${roms.length}`);
  console.log(`✅ Uploaded: ${uploaded}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\nFailed uploads:');
    roms.filter(r => !r.uploaded).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }
  
  console.log('\n🎮 Next steps:');
  console.log('1. Add <script src="js/rom-config.js"></script> to arcade.html');
  console.log('2. Replace demo ROMs with your legally dumped ROMs');
  console.log('3. Update game cards to call playROM(gameId) on click');
}

main().catch(console.error);
