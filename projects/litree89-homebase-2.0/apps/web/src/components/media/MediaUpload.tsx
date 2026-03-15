'use client';

import React, { useRef, useState } from 'react';
import type { Media } from '@/lib/types';

interface MediaUploadProps {
  onMediaAdded: (media: Media) => void;
  maxFiles?: number;
}

export function MediaUpload({ onMediaAdded, maxFiles = 10 }: MediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setError('Only images and videos are supported');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('File is too large (max 100MB)');
      return;
    }

    setUploading(true);
    setError(null);

    // Local preview
    setPreview(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('fileType', file.type);

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { media } = await response.json();
      onMediaAdded(media);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        className="relative w-full border-2 border-dashed border-amber-400/30 rounded-lg p-6 cursor-pointer hover:border-amber-400/60 transition-colors bg-transparent text-left"
        onClick={() => fileInputRef.current?.click()}
        aria-label="Upload media file - click or press space/enter"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          aria-label="Upload media file"
        />

        {preview ? (
          <div className="relative w-full">
            <img src={preview} alt="Upload preview" className="w-full h-64 object-cover rounded" />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                <div className="text-amber-100">Uploading...</div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📸</div>
            <p className="text-amber-100 font-medium">Click to upload media</p>
            <p className="text-amber-100/60 text-sm">Images or videos (max 100MB)</p>
          </div>
        )}
      </button>

      {error && <div className="text-red-400 text-sm">{error}</div>}
    </div>
  );
}
