'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface MediaPreview {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

interface MediaUploaderProps {
  onMediaSelect?: (media: MediaPreview[]) => void;
  maxFiles?: number;
  acceptTypes?: string;
  onUpload?: (files: File[]) => Promise<string[]>;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  onMediaSelect,
  maxFiles = 5,
  acceptTypes = 'image/*,video/*',
  onUpload,
}) => {
  const [media, setMedia] = useState<MediaPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files).slice(0, maxFiles - media.length);

    newFiles.forEach(file => {
      const reader = new FileReader();

      reader.onload = e => {
        const preview = e.target?.result as string;
        const type = file.type.startsWith('image') ? 'image' : 'video';

        const newMedia: MediaPreview = {
          file,
          preview,
          type,
        };

        setMedia(prev => [...prev, newMedia]);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!onUpload || media.length === 0) return;

    setIsUploading(true);
    try {
      const files = media.map(m => m.file);
      const urls = await onUpload(files);

      if (onMediaSelect) {
        const uploadedMedia = media.map((m, index) => ({
          ...m,
          preview: urls[index] || m.preview,
        }));
        onMediaSelect(uploadedMedia);
      }

      setMedia([]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50',
          media.length >= maxFiles && 'pointer-events-none opacity-50',
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (media.length < maxFiles) {
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptTypes}
          onChange={e => handleFileSelect(e.target.files)}
          className="hidden"
          aria-label="Select media files to upload"
        />

        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium">Drag files or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">
          {media.length}/{maxFiles} files selected
        </p>
      </div>

      {/* Media Preview Grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {media.map((m, index) => (
            <div
              key={`media-${index}-${Date.now()}`}
              className="relative group rounded-lg overflow-hidden bg-muted aspect-square"
            >
              {m.type === 'image' ? (
                <img
                  src={m.preview}
                  alt={`Image preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <video src={m.preview} className="w-full h-full object-cover" muted />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                </>
              )}

              <button
                onClick={() => removeMedia(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition"
                aria-label={`Remove ${m.type} ${index + 1}`}
                title={`Remove ${m.type} ${index + 1}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {media.length > 0 && onUpload && (
        <Button onClick={handleUpload} disabled={isUploading} className="w-full">
          {isUploading ? 'Uploading...' : `Upload ${media.length} file(s)`}
        </Button>
      )}
    </div>
  );
};

export default MediaUploader;
