'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon, CheckCircle2, AlertCircle, Link as LinkIcon, RefreshCw } from 'lucide-react';

interface ImageUploadZoneProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: 'products' | 'brands' | 'categories' | 'general';
  helperText?: string;
  required?: boolean;
}

export function ImageUploadZone({
  label,
  value,
  onChange,
  folder = 'products',
  helperText = 'PNG, JPG, WebP, or AVIF (Recommended min 800x800px)',
  required = false,
}: ImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [manualMode, setManualMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Selected file is not an image. Please choose a PNG, JPG, or WebP file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file exceeds the 10MB limit.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.url) {
        onChange(data.url);
      } else {
        setError(data.error || 'Failed to upload image. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error uploading file.');
    } finally {
      setUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="font-bold uppercase text-[11px] text-charcoal-700 block">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setManualMode(!manualMode)}
          className="text-[10px] text-brand-700 hover:underline flex items-center gap-1 font-semibold"
        >
          {manualMode ? (
            <>
              <UploadCloud className="w-3 h-3" />
              <span>Switch to File Upload</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-3 h-3" />
              <span>Or Paste Image URL</span>
            </>
          )}
        </button>
      </div>

      {manualMode ? (
        <div>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 focus:outline-none focus:bg-white focus:border-brand-600 transition-colors text-xs"
          />
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/avif"
            onChange={onInputChange}
            className="hidden"
          />

          {value ? (
            /* Uploaded Image Preview Card */
            <div className="relative p-3 rounded-2xl bg-rose-50/30 border border-rose-200 flex items-center gap-4 group">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-rose-100 flex-shrink-0 shadow-2xs">
                <img
                  src={value}
                  alt={label}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback on broken image
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Image Ready</span>
                </div>
                <p className="text-[11px] text-charcoal-600 truncate font-mono">
                  {value}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-2.5 py-1 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg text-[10px] font-bold text-charcoal-700 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>Change Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange('')}
                    className="px-2.5 py-1 bg-white hover:bg-red-50 border border-red-200 rounded-lg text-[10px] font-bold text-red-600 transition-colors flex items-center gap-1"
                  >
                    <X className="w-2.5 h-2.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Drag & Drop Upload Dropzone */
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-brand-600 bg-brand-50/60 scale-[1.01]'
                  : 'border-rose-200 hover:border-brand-400 bg-rose-50/20 hover:bg-rose-50/40'
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center justify-center space-y-2 py-2">
                  <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-charcoal-700">Uploading image to server...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2 py-1">
                  <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-200/80 shadow-2xs">
                    <UploadCloud className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-brand-700 hover:underline">
                      Click to browse image file
                    </span>
                    <span className="text-xs text-charcoal-500"> or drag &amp; drop here</span>
                  </div>
                  <p className="text-[10px] text-charcoal-400">
                    {helperText}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
