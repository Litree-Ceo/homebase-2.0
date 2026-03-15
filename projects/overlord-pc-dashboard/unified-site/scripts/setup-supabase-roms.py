#!/usr/bin/env python3
"""
Supabase ROM Storage Setup Script
Creates 'roms' bucket and uploads sample ROM files for EmulatorJS

Usage:
    python setup-supabase-roms.py --url https://your-project.supabase.co --key your-anon-key
"""

import argparse
import os
import sys
from pathlib import Path

try:
    from supabase import create_client, Client
except ImportError:
    print("Installing supabase-py...")
    os.system("pip install supabase")
    from supabase import create_client, Client

# Sample ROM metadata - in production, these would be actual ROM files
# that the user owns and has dumped legally
SAMPLE_ROMS = [
    {
        "name": "Super Mario Bros (USA).nes",
        "console": "nes",
        "filename": "super_mario_bros.nes",
        "size_kb": 40,
        "description": "NES Platformer",
        "icon": "🍄"
    },
    {
        "name": "The Legend of Zelda (USA).nes",
        "console": "nes",
        "filename": "legend_of_zelda.nes",
        "size_kb": 128,
        "description": "NES Action-Adventure",
        "icon": "🗡️"
    },
    {
        "name": "Super Mario World (USA).snes",
        "console": "snes",
        "filename": "super_mario_world.smc",
        "size_kb": 512,
        "description": "SNES Platformer",
        "icon": "🦖"
    },
    {
        "name": "Zelda - Link to the Past (USA).snes",
        "console": "snes",
        "filename": "zelda_link_past.smc",
        "size_kb": 1024,
        "description": "SNES Action-Adventure",
        "icon": "🏹"
    },
    {
        "name": "Sonic the Hedgehog (USA).gen",
        "console": "genesis",
        "filename": "sonic.md",
        "size_kb": 512,
        "description": "Genesis Platformer",
        "icon": "💨"
    },
    {
        "name": "Streets of Rage 2 (USA).gen",
        "console": "genesis",
        "filename": "streets_rage_2.md",
        "size_kb": 1024,
        "description": "Genesis Beat 'em up",
        "icon": "👊"
    },
    {
        "name": "Super Mario Advance (USA).gba",
        "console": "gba",
        "filename": "mario_advance.gba",
        "size_kb": 4096,
        "description": "GBA Platformer",
        "icon": "🍄"
    },
    {
        "name": "Metroid Fusion (USA).gba",
        "console": "gba",
        "filename": "metroid_fusion.gba",
        "size_kb": 8192,
        "description": "GBA Action-Adventure",
        "icon": "👾"
    }
]


def create_sample_rom_file(output_dir: Path, rom_info: dict) -> Path:
    """Create a sample ROM file (placeholder data for demo purposes)"""
    file_path = output_dir / rom_info["filename"]
    
    # Create a dummy ROM file with NES header for NES games
    # In production, users would replace these with their own legally dumped ROMs
    if rom_info["console"] == "nes":
        # NES header (16 bytes) + dummy data
        header = b'NES\x1a\x02\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
        data = header + b'\x00' * (rom_info["size_kb"] * 1024 - 16)
    elif rom_info["console"] == "snes":
        # SNES header
        header = b'\x00' * 512  # SMC header
        data = header + b'\x00' * (rom_info["size_kb"] * 1024 - 512)
    elif rom_info["console"] == "genesis":
        # Genesis header (SEGA...)
        header = b'SEGA GENESIS    '
        data = header + b'\x00' * (rom_info["size_kb"] * 1024 - 16)
    elif rom_info["console"] == "gba":
        # GBA header
        header = b'\x00' * 192  # GBA header size
        data = header + b'\x00' * (rom_info["size_kb"] * 1024 - 192)
    else:
        data = b'\x00' * (rom_info["size_kb"] * 1024)
    
    file_path.write_bytes(data)
    return file_path


def setup_supabase_storage(supabase_url: str, supabase_key: str):
    """Setup Supabase storage bucket and upload ROMs"""
    
    print(f"🔗 Connecting to Supabase: {supabase_url}")
    supabase: Client = create_client(supabase_url, supabase_key)
    
    # Create roms bucket
    bucket_name = "roms"
    print(f"\n📦 Creating bucket: {bucket_name}")
    
    try:
        # Try to create bucket
        supabase.storage.create_bucket(
            bucket_name,
            options={"public": True, "file_size_limit": 10485760}  # 10MB limit
        )
        print(f"✅ Bucket '{bucket_name}' created successfully")
    except Exception as e:
        if "already exists" in str(e).lower():
            print(f"ℹ️  Bucket '{bucket_name}' already exists")
        else:
            print(f"⚠️  Bucket creation warning: {e}")
    
    # Create local ROM files directory
    roms_dir = Path(__file__).parent.parent / "roms"
    roms_dir.mkdir(exist_ok=True)
    print(f"\n📁 ROM directory: {roms_dir}")
    
    uploaded_roms = []
    
    # Create and upload each ROM
    for rom in SAMPLE_ROMS:
        print(f"\n🎮 Processing: {rom['name']}")
        
        # Create local file
        file_path = create_sample_rom_file(roms_dir, rom)
        print(f"   Created: {file_path} ({rom['size_kb']} KB)")
        
        # Upload to Supabase
        storage_path = f"{rom['console']}/{rom['filename']}"
        
        try:
            with open(file_path, "rb") as f:
                result = supabase.storage.from_(bucket_name).upload(
                    path=storage_path,
                    file=f,
                    file_options={"content-type": "application/octet-stream", "upsert": True}
                )
            
            # Get public URL
            public_url = supabase.storage.from_(bucket_name).get_public_url(storage_path)
            
            uploaded_roms.append({
                **rom,
                "storage_path": storage_path,
                "public_url": public_url,
                "uploaded": True
            })
            
            print(f"   ✅ Uploaded: {storage_path}")
            print(f"   🔗 URL: {public_url}")
            
        except Exception as e:
            print(f"   ❌ Upload failed: {e}")
            uploaded_roms.append({
                **rom,
                "storage_path": storage_path,
                "public_url": None,
                "uploaded": False,
                "error": str(e)
            })
    
    # Generate JavaScript config for arcade.html
    generate_rom_config(uploaded_roms)
    
    return uploaded_roms


def generate_rom_config(roms: list):
    """Generate JavaScript configuration file for ROM URLs"""
    
    config_path = Path(__file__).parent.parent / "static" / "js" / "rom-config.js"
    config_path.parent.mkdir(parents=True, exist_ok=True)
    
    js_content = """// Auto-generated ROM configuration
// Generated by setup-supabase-roms.py

const SUPABASE_ROMS = {
"""
    
    for rom in roms:
        if rom.get("uploaded"):
            game_id = rom["filename"].replace(".", "_").replace("-", "_")
            js_content += f'''    {game_id}: {{
        name: "{rom['name']}",
        console: "{rom['console']}",
        url: "{rom['public_url']}",
        size: {rom['size_kb']},
        description: "{rom['description']}",
        icon: "{rom['icon']}"
    }},
'''
    
    js_content += """};

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
"""
    
    config_path.write_text(js_content)
    print(f"\n📝 Generated ROM config: {config_path}")


def main():
    parser = argparse.ArgumentParser(description="Setup Supabase ROM storage")
    parser.add_argument("--url", required=True, help="Supabase project URL")
    parser.add_argument("--key", required=True, help="Supabase anon/public key")
    parser.add_argument("--demo", action="store_true", help="Create demo files only (no upload)")
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("🎮 LiTree Labs Arcade - ROM Storage Setup")
    print("=" * 60)
    
    if args.demo:
        print("\n📁 DEMO MODE: Creating local ROM files only")
        roms_dir = Path(__file__).parent.parent / "roms"
        roms_dir.mkdir(exist_ok=True)
        
        for rom in SAMPLE_ROMS:
            file_path = create_sample_rom_file(roms_dir, rom)
            print(f"✅ Created: {file_path.name} ({rom['size_kb']} KB)")
        
        print(f"\n📁 ROMs saved to: {roms_dir}")
        print("\n⚠️  IMPORTANT: Replace these placeholder files with your own legally dumped ROMs!")
        return
    
    # Full setup with Supabase
    roms = setup_supabase_storage(args.url, args.key)
    
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    
    uploaded = sum(1 for r in roms if r.get("uploaded"))
    failed = len(roms) - uploaded
    
    print(f"Total ROMs: {len(roms)}")
    print(f"✅ Uploaded: {uploaded}")
    print(f"❌ Failed: {failed}")
    
    if failed > 0:
        print("\nFailed uploads:")
        for rom in roms:
            if not rom.get("uploaded"):
                print(f"  - {rom['name']}: {rom.get('error', 'Unknown error')}")
    
    print("\n🎮 Next steps:")
    print("1. Include rom-config.js in your arcade.html")
    print("2. Replace demo ROMs with your legally dumped ROMs")
    print("3. Update arcade.html to use loadROMFromSupabase()")


if __name__ == "__main__":
    main()
