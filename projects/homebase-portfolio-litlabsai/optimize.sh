#!/bin/bash
# Media optimizer - run before adding assets to project
echo "🎨 Optimizing images..."
for img in raw_images/*.{jpg,png}; do
  [ -f "$img" ] && convert "$img" -resize 1920x1080\> -quality 85 "public/images/$(basename $img)"
done

echo "🎬 Optimizing videos..."
for vid in raw_videos/*.{mp4,mov}; do
  [ -f "$vid" ] && ffmpeg -i "$vid" -vcodec h264 -acodec aac -b:v 1000k "public/videos/$(basename $vid .mov).mp4"
done
echo "✅ Done! Check public/ folder"
