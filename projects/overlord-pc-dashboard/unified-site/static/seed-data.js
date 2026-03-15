// seed-data.js - Matches actual Supabase/user_assets schema
// Fields: id, user_id, name, storage_path, public_url, asset_type, file_size, metadata, created_at, updated_at

const SYSTEM_USER_ID = 'system-overlord'; // or use: '550e8400-e29b-41d4-a716-446655440000'

const SAMPLE_ASSETS = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    user_id: SYSTEM_USER_ID,
    title: 'Blood Samurai',
    description: 'AI-generated cyber-samurai theme, dripping blood effects',
    price: 4.99,
    type: 'theme',
    name: "Blood Samurai Wallpaper",
    storage_path: "assets/wallpapers/blood-samurai-4k.png",
    asset_url: 'https://your-supabase-url/storage/v1/object/public/themes/blood-samurai.glb', // ← use ACTUAL column name here, e.g. asset_url or url
    // legacy fallback:
    public_url: "https://cdn.litlabs.net/assets/blood-samurai-4k.png",
    asset_type: "image/png",
    file_size: 2457600,
    metadata: {
      category: "wallpaper",
      resolution: "3840x2160",
      theme: "blood-samurai",
      ai_generated: true,
      ai_model: "midjourney-v6"
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    user_id: SYSTEM_USER_ID,
    title: 'Neon Tokyo Drift',
    description: 'High-speed Tokyo street racing with neon aesthetics',
    price: 3.99,
    type: 'theme',
    name: "Neon Tokyo Cityscape",
    storage_path: "assets/wallpapers/neon-tokyo-drift.png",
    asset_url: 'https://your-supabase-url/storage/v1/object/public/themes/neon-tokyo.glb',
    public_url: "https://cdn.litlabs.net/assets/neon-tokyo-drift.png",
    asset_type: "image/png",
    file_size: 1892000,
    metadata: {
      category: "wallpaper",
      resolution: "3840x2160",
      theme: "neon-tokyo-drift",
      ai_generated: true,
      ai_model: "dalle3"
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    user_id: SYSTEM_USER_ID,
    title: 'Glitch Core',
    description: 'Digital corruption aesthetic with CRT scanlines',
    price: 2.99,
    type: 'theme',
    name: "Glitch Core Pattern",
    storage_path: "assets/textures/glitch-core-seamless.png",
    asset_url: 'https://your-supabase-url/storage/v1/object/public/themes/glitch-core.glb',
    public_url: "https://cdn.litlabs.net/assets/glitch-core-seamless.png",
    asset_type: "image/png",
    file_size: 890000,
    metadata: {
      category: "texture",
      resolution: "2048x2048",
      theme: "glitch-core",
      seamless: true,
      ai_generated: true,
      ai_model: "stable-diffusion-xl"
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    user_id: SYSTEM_USER_ID,
    title: 'Synthwave Sunset',
    description: '4K looping video with retro-futuristic grid horizon',
    price: 1.49,
    type: 'theme',
    name: "Synthwave Grid Video",
    storage_path: "assets/videos/synthwave-grid-loop.mp4",
    asset_url: 'https://your-supabase-url/storage/v1/object/public/themes/synthwave-grid.mp4',
    public_url: "https://cdn.litlabs.net/assets/synthwave-grid-loop.mp4",
    asset_type: "video/mp4",
    file_size: 15728640,
    metadata: {
      category: "video",
      resolution: "1920x1080",
      duration: "10s",
      loop: true,
      theme: "synthwave-sunset"
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    user_id: SYSTEM_USER_ID,
    title: 'Hacker Terminal',
    description: 'Monospace terminal font for authentic hacker aesthetic',
    price: 0.00,
    type: 'theme',
    name: "Hacker Terminal Font",
    storage_path: "assets/fonts/terminal-mono.woff2",
    asset_url: 'https://your-supabase-url/storage/v1/object/public/themes/terminal-mono.woff2',
    public_url: "https://cdn.litlabs.net/assets/terminal-mono.woff2",
    asset_type: "font/woff2",
    file_size: 45000,
    metadata: {
      category: "font",
      family: "Terminal Mono",
      weight: "400,700",
      theme: "hacker-terminal"
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Add 10+ more: Neon Tokyo Drift, Acid Rain, Glitch Core, etc.
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    user_id: SYSTEM_USER_ID,
    title: 'Neon Tokyo Drift',
    description: 'High-speed Tokyo street racing with neon aesthetics',
    price: 3.99,
    type: 'theme',
    name: "Neon Tokyo Drift",
    storage_path: "assets/wallpapers/neon-tokyo-drift.png",
    asset_url: 'https://your-supabase-url/storage/v1/object/public/themes/neon-tokyo-drift.png',
    public_url: "https://cdn.litlabs.net/assets/neon-tokyo-drift.png",
    asset_type: "image/png",
    file_size: 1892000,
    metadata: {
      category: "wallpaper",
      resolution: "3840x2160",
      theme: "neon-tokyo-drift",
      ai_generated: true,
      ai_model: "dalle3"
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    user_id: SYSTEM_USER_ID,
    title: 'Acid Wasteland',
    description: 'Post-apocalyptic radioactive theme with toxic green/yellow gradients',
    price: 3.49,
    type: 'theme',
    name: "Acid Wasteland",
    storage_path: "assets/wallpapers/acid-wasteland.png",
    asset_url: 'https://your-supabase-url/storage/v1/object/public/themes/acid-wasteland.png',
    public_url: "https://cdn.litlabs.net/assets/acid-wasteland.png",
    asset_type: "image/png",
    file_size: 2100000,
    metadata: {
      category: "wallpaper",
      resolution: "3840x2160",
      theme: "acid-wasteland",
      ai_generated: true,
      ai_model: "midjourney-v6"
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    user_id: SYSTEM_USER_ID,
    title: 'Royal Obsidian',
    description: 'Luxurious dark theme with gold and deep purple accents',
    price: 5.99,
    type: 'theme',
    name: "Royal Obsidian",
    storage_path: "assets/wallpapers/royal-obsidian.png",
    asset_url: 'https://your-supabase-url/storage/v1/object/public/themes/royal-obsidian.png',
    public_url: "https://cdn.litlabs.net/assets/royal-obsidian.png",
    asset_type: "image/png",
    file_size: 1800000,
    metadata: {
      category: "wallpaper",
      resolution: "3840x2160",
      theme: "royal-obsidian",
      ai_generated: true,
      ai_model: "midjourney-v6"
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440008",
    user_id: SYSTEM_USER_ID,
    title: 'Void Obsidian',
    description: 'Premium dark mode for professionals with OLED optimization',
    price: 0.00,
    type: 'theme',
    name: "Void Obsidian",
    storage_path: "assets/wallpapers/void-obsidian.png",
    asset_url: 'https://your-supabase-url/storage/v1/object/public/themes/void-obsidian.png',
    public_url: "https://cdn.litlabs.net/assets/void-obsidian.png",
    asset_type: "image/png",
    file_size: 1200000,
    metadata: {
      category: "wallpaper",
      resolution: "3840x2160",
      theme: "void-obsidian",
      ai_generated: true,
      ai_model: "midjourney-v6"
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440009",
    user_id: SYSTEM_USER_ID,
    title: 'Arctic Frost',
    description: 'Crisp arctic aesthetic with ice blues and whites',
    price: 1.99,
    type: 'theme',
    name: "Arctic Frost",
    storage_path: "assets/wallpapers/arctic-frost.png",
    asset_url: 'https://your-supabase-url/storage/v1/object/public/themes/arctic-frost.png',
    public_url: "https://cdn.litlabs.net/assets/arctic-frost.png",
    asset_type: "image/png",
    file_size: 1950000,
    metadata: {
      category: "wallpaper",
      resolution: "3840x2160",
      theme: "arctic-frost",
      ai_generated: true,
      ai_model: "midjourney-v6"
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    user_id: SYSTEM_USER_ID,
    title: 'Inferno Forged',
    description: 'Intense volcanic theme with magma flows and forge-like heat',
    price: 3.99,
    type: 'theme',
    name: "Inferno Forged",
    storage_path: "assets/wallpapers/inferno-forged.png",
    asset_url: 'https://your-supabase-url/storage/v1/object/public/themes/inferno-forged.png',
    public_url: "https://cdn.litlabs.net/assets/inferno-forged.png",
    asset_type: "image/png",
    file_size: 2300000,
    metadata: {
      category: "wallpaper",
      resolution: "3840x2160",
      theme: "inferno-forged",
      ai_generated: true,
      ai_model: "dalle3"
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440011",
    user_id: SYSTEM_USER_ID,
    title: 'Futuristic Empire OS',
    description: 'Majestic imperial interface for those who rule their digital domain',
    price: 6.99,
    type: 'theme',
    name: "Futuristic Empire OS",
    storage_path: "assets/wallpapers/futuristic-empire-os.png",
    asset_url: 'https://your-supabase-url/storage/v1/object/public/themes/futuristic-empire-os.png',
    public_url: "https://cdn.litlabs.net/assets/futuristic-empire-os.png",
    asset_type: "image/png",
    file_size: 2800000,
    metadata: {
      category: "wallpaper",
      resolution: "3840x2160",
      theme: "futuristic-empire-os",
      ai_generated: true,
      ai_model: "midjourney-v6",
      featured: true
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440012",
    user_id: SYSTEM_USER_ID,
    title: 'Cyber Shadow',
    description: 'Dark cyberpunk with purple neon shadows',
    price: 2.49,
    type: 'theme',
    name: "Cyber Shadow",
    storage_path: "assets/wallpapers/cyber-shadow.png",
    asset_url: 'https://your-supabase-url/storage/v1/object/public/themes/cyber-shadow.png',
    public_url: "https://cdn.litlabs.net/assets/cyber-shadow.png",
    asset_type: "image/png",
    file_size: 1750000,
    metadata: {
      category: "wallpaper",
      resolution: "3840x2160",
      theme: "cyber-shadow",
      ai_generated: true,
      ai_model: "stable-diffusion-xl"
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440013",
    user_id: SYSTEM_USER_ID,
    title: 'Quantum Leap',
    description: 'Blue quantum particles and energy fields',
    price: 4.49,
    type: 'theme',
    name: "Quantum Leap",
    storage_path: "assets/wallpapers/quantum-leap.png",
    asset_url: 'https://your-supabase-url/storage/v1/object/public/themes/quantum-leap.png',
    public_url: "https://cdn.litlabs.net/assets/quantum-leap.png",
    asset_type: "image/png",
    file_size: 2050000,
    metadata: {
      category: "wallpaper",
      resolution: "3840x2160",
      theme: "quantum-leap",
      ai_generated: true,
      ai_model: "midjourney-v6"
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440014",
    user_id: SYSTEM_USER_ID,
    title: 'Neon Noir',
    description: 'Classic noir with neon pink highlights',
    price: 3.29,
    type: 'theme',
    name: "Neon Noir",
    storage_path: "assets/wallpapers/neon-noir.png",
    asset_url: 'https://your-supabase-url/storage/v1/object/public/themes/neon-noir.png',
    public_url: "https://cdn.litlabs.net/assets/neon-noir.png",
    asset_type: "image/png",
    file_size: 1680000,
    metadata: {
      category: "wallpaper",
      resolution: "3840x2160",
      theme: "neon-noir",
      ai_generated: true,
      ai_model: "dalle3"
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// IMPORTANT: Upload images/GLBs to Supabase Storage FIRST via dashboard
// Then update the asset_url fields below with your actual public storage URLs
// Format: https://your-project.supabase.co/storage/v1/object/public/bucket-name/filename
//
// PATCHED: Insert function with proper column handling
// 
// SQL FALLBACK (if JS client fails):
// INSERT INTO user_assets (
//   id, user_id, name, storage_path, public_url, asset_type, 
//   file_size, metadata, created_at, updated_at
// ) VALUES (
//   'uuid-here', 'user-id', 'Asset Name',
//   'path/to/file.png', 'https://cdn...', 'image/png',
//   2457600, '{"key":"value"}', NOW(), NOW()
// )
// ON CONFLICT (id) DO UPDATE SET updated_at = NOW();
//
async function seedUserAssets(supabaseClient) {
  console.log('Seeding user_assets...');
  
  for (const asset of SAMPLE_ASSETS) {
    // Map fields to match Supabase column names exactly
    const dbRecord = {
      id: asset.id,
      user_id: asset.user_id,
      title: asset.title,
      description: asset.description,
      price: asset.price,
      type: asset.type,
      name: asset.name,
      // Use storage_path OR file_path depending on your Supabase schema
      storage_path: asset.storage_path || asset.file_path,
      asset_url: asset.asset_url, // ← ACTUAL column name: asset_url or url
      public_url: asset.public_url || asset.file_url,
      asset_type: asset.asset_type || asset.file_type,
      file_size: asset.file_size,
      metadata: asset.metadata,
      created_at: asset.created_at,
      updated_at: asset.updated_at
    };

    // Try insert first (cleaner for new records)
    const { data, error } = await supabaseClient
      .from('user_assets')
      .insert([dbRecord])
      .select();
    
    if (error) {
      console.error(`Failed to seed ${asset.name}:`, error.message);
    } else {
      console.log(`✓ Seeded: ${asset.name}`);
    }
  }
  
  console.log('Seeding complete!');
}

// Auto-run if called via Node.js CLI
if (typeof require !== 'undefined' && require.main === module) {
  console.log('🌱 LiTree Labs - Seed Data');
  console.log('📦 This file contains 15 sample assets for user_assets table');
  console.log('');
  console.log('To seed to Supabase:');
  console.log('  1. Upload images to Supabase Storage first');
  console.log('  2. Update asset_url fields with real URLs');
  console.log('  3. Use seed-data-node.js for Node.js execution');
  console.log('  4. Or import seedUserAssets() in your app');
  console.log('');
  console.log('Example:');
  console.log('  const { seedUserAssets } = require("./seed-data.js");');
  console.log('  await seedUserAssets(supabaseClient);');
  console.log('');
  console.log(`📊 Assets defined: ${SAMPLE_ASSETS.length}`);
  SAMPLE_ASSETS.forEach((a, i) => {
    const price = a.price === 0 ? 'FREE' : `$${a.price}`;
    console.log(`   ${i+1}. ${a.title} (${price})`);
  });
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SAMPLE_ASSETS, seedUserAssets };
}
