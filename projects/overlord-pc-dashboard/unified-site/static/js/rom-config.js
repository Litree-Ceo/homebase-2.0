// Auto-generated ROM configuration
// Run: node scripts/setup-supabase-roms.js --url YOUR_URL --key YOUR_KEY
// To populate this with real Supabase storage URLs

const SUPABASE_ROMS = {
    // Placeholder - replace with actual Supabase storage URLs after running setup
    super_mario_bros_nes: {
        name: "Super Mario Bros (USA).nes",
        console: "nes",
        url: null, // Will be set after upload
        size: 40,
        description: "NES Platformer",
        icon: "🍄"
    },
    legend_of_zelda_nes: {
        name: "The Legend of Zelda (USA).nes",
        console: "nes",
        url: null,
        size: 128,
        description: "NES Action-Adventure",
        icon: "🗡️"
    },
    super_mario_world_smc: {
        name: "Super Mario World (USA).snes",
        console: "snes",
        url: null,
        size: 512,
        description: "SNES Platformer",
        icon: "🦖"
    },
    zelda_link_past_smc: {
        name: "Zelda - Link to the Past (USA).snes",
        console: "snes",
        url: null,
        size: 1024,
        description: "SNES Action-Adventure",
        icon: "🏹"
    },
    sonic_md: {
        name: "Sonic the Hedgehog (USA).gen",
        console: "genesis",
        url: null,
        size: 512,
        description: "Genesis Platformer",
        icon: "💨"
    },
    streets_rage_2_md: {
        name: "Streets of Rage 2 (USA).gen",
        console: "genesis",
        url: null,
        size: 1024,
        description: "Genesis Beat 'em up",
        icon: "👊"
    },
    mario_advance_gba: {
        name: "Super Mario Advance (USA).gba",
        console: "gba",
        url: null,
        size: 4096,
        description: "GBA Platformer",
        icon: "🍄"
    },
    metroid_fusion_gba: {
        name: "Metroid Fusion (USA).gba",
        console: "gba",
        url: null,
        size: 8192,
        description: "GBA Action-Adventure",
        icon: "👾"
    }
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
    
    // Check if URL is configured
    if (!rom.url) {
        console.error('ROM URL not configured. Run setup-supabase-roms.js');
        return null;
    }
    
    try {
        const response = await fetch(rom.url);
        if (!response.ok) throw new Error('Failed to fetch ROM: ' + response.status);
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
    console.log('🎮 Loading ROM:', gameId);
    
    // Show loading state
    const placeholder = document.getElementById('emulatorPlaceholder');
    const originalContent = placeholder.innerHTML;
    placeholder.innerHTML = `
        <div class="placeholder-icon">⏳</div>
        <div class="placeholder-text">LOADING ROM...</div>
        <div class="placeholder-sub">Fetching from Supabase storage</div>
    `;
    
    const rom = await loadROMFromSupabase(gameId);
    
    if (!rom) {
        // Restore placeholder and show error
        placeholder.innerHTML = originalContent;
        
        setTimeout(() => {
            alert(`⚠️ Could Not Load ROM\n\nThis game is not yet available in cloud storage.\n\nTo play:\n1. Use the file loader below to upload your own ROM\n2. Or run: node scripts/setup-supabase-roms.js\n\nRemember: Only play ROMs you legally own!`);
        }, 100);
        return;
    }
    
    // Start EmulatorJS with the loaded ROM
    if (window.startEmulator) {
        window.startEmulator(rom.data, rom.console, rom.name);
    } else {
        console.error('Emulator not initialized');
        placeholder.innerHTML = originalContent;
    }
}
