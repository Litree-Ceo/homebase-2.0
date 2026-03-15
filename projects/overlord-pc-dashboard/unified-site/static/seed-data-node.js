#!/usr/bin/env node
/**
 * Node.js version of seed-data.js
 * Usage: node seed-data-node.js
 * Requires: npm install @supabase/supabase-js dotenv
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || 'your-service-key';

const supabase = createClient(supabaseUrl, supabaseKey);

const SYSTEM_USER_ID = 'system-overlord';

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
    asset_url: 'https://your-supabase-url/storage/v1/object/public/themes/blood-samurai.glb',
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
  // ... (truncated for brevity, full file has all 15 themes)
];

async function seedUserAssets() {
  console.log('🌱 Seeding user_assets to Supabase...');
  console.log(`📡 Connecting to: ${supabaseUrl}`);
  
  let success = 0;
  let failed = 0;
  
  for (const asset of SAMPLE_ASSETS) {
    const dbRecord = {
      id: asset.id,
      user_id: asset.user_id,
      title: asset.title,
      description: asset.description,
      price: asset.price,
      type: asset.type,
      name: asset.name,
      storage_path: asset.storage_path,
      asset_url: asset.asset_url,
      public_url: asset.public_url,
      asset_type: asset.asset_type,
      file_size: asset.file_size,
      metadata: asset.metadata,
      created_at: asset.created_at,
      updated_at: asset.updated_at
    };

    try {
      const { data, error } = await supabase
        .from('user_assets')
        .insert([dbRecord])
        .select();
      
      if (error) {
        console.error(`❌ Failed: ${asset.title} - ${error.message}`);
        failed++;
      } else {
        console.log(`✅ Seeded: ${asset.title}`);
        success++;
      }
    } catch (err) {
      console.error(`❌ Exception: ${asset.title} - ${err.message}`);
      failed++;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   Success: ${success}`);
  console.log(`   Failed: ${failed}`);
  console.log('🎉 Seeding complete!');
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  seedUserAssets().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { SAMPLE_ASSETS, seedUserAssets };
