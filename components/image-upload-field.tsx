'use client';

import React, { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, Loader2, ImageIcon, Link2 } from 'lucide-react';

type PreviewShape = 'square' | 'wide' | 'circle' | 'banner';

export type ImageUploadFieldProps = {
  value?: string;
  onValueChange?: (url: string) => void;
  onUpload: (file: File) => void | Promise<void>;
  uploading?: boolean;
  label?: string;
  urlLabel?: string;
  uploadLabel?: string;
  hint?: string;
  urlPlaceholder?: string;
  showUrlInput?: boolean;
  previewShape?: PreviewShape;
  compact?: boolean;
  required?: boolean;
  className?: string;
};

export function ImageUploadField({
  value = '',
  onValueChange,
  onUpload,
  uploading = false,
  label,
  urlLabel = 'Image URL',
  uploadLabel = 'Upload to ImgBB',
  hint = 'JPEG, PNG or WebP — drag & drop or click',
  urlPlaceholder = 'https://...',
  showUrlInput = true,
  previewShape = 'square',
  compact = false,
  required,
  className = '',
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const pickFile = useCallback(
    async (file: File | undefined) => {
      if (!file || !file.type.startsWith('image/')) return;
      await onUpload(file);
      if (inputRef.current) inputRef.current.value = '';
    },
    [onUpload]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      void pickFile(e.dataTransfer.files?.[0]);
    },
    [pickFile]
  );

  const previewClass =
    previewShape === 'circle'
      ? 'w-16 h-16 rounded-full mx-auto'
      : previewShape === 'wide'
        ? 'w-full h-24 rounded-xl'
        : previewShape === 'banner'
          ? 'w-full h-32 rounded-xl'
          : 'w-14 h-14 rounded-lg';

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-[10px] uppercase font-black tracking-wider text-stone-500">
          {label}
        </label>
      )}

      <div
        className={`rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-50 to-white overflow-hidden ${
          compact ? 'p-2' : 'p-3'
        }`}
      >
        {showUrlInput && onValueChange && (
          <div className={compact ? 'mb-2' : 'mb-3'}>
            <span className="text-[9px] font-bold uppercase text-stone-400 flex items-center gap-1 mb-1">
              <Link2 className="w-3 h-3" aria-hidden />
              {urlLabel}
            </span>
            <input
              type="url"
              placeholder={urlPlaceholder}
              required={required && !value}
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              className="w-full text-stone-800 bg-white border border-stone-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a234d]/20 focus:border-[#1a234d] font-medium"
            />
          </div>
        )}

        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center text-center cursor-pointer transition-all border-2 border-dashed rounded-xl ${
            compact ? 'py-4 px-3' : 'py-6 px-4'
          } ${
            dragOver
              ? 'border-[#f5b075] bg-[#fef8f2]/80 scale-[1.01]'
              : 'border-stone-300 hover:border-[#1a234d]/40 hover:bg-white'
          } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => void pickFile(e.target.files?.[0])}
          />

          {uploading ? (
            <Loader2 className="w-8 h-8 text-[#1a234d] animate-spin mb-2" aria-hidden />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#1a234d]/10 flex items-center justify-center mb-2">
              {dragOver ? (
                <ImageIcon className="w-5 h-5 text-[#1a234d]" aria-hidden />
              ) : (
                <Upload className="w-5 h-5 text-[#1a234d]" aria-hidden />
              )}
            </div>
          )}

          <span className="text-[10px] font-black uppercase tracking-wide text-[#1a234d] block">
            {uploading ? 'Uploading to ImgBB...' : uploadLabel}
          </span>
          {!compact && (
            <span className="text-[9px] text-stone-400 mt-1 block max-w-[220px]">{hint}</span>
          )}
        </div>

        {value && (
          <div className={`mt-3 flex items-center gap-3 ${previewShape === 'circle' ? 'flex-col' : ''}`}>
            <div className={`relative shrink-0 border border-stone-200 bg-white overflow-hidden ${previewClass}`}>
              <Image src={value} alt="" fill className="object-cover" referrerPolicy="no-referrer" sizes="120px" />
            </div>
            <div className={`min-w-0 ${previewShape === 'circle' ? 'text-center' : ''}`}>
              <span className="text-[9px] font-extrabold uppercase text-emerald-600 block">✓ Image ready</span>
              <span className="text-[9px] text-stone-400 truncate block font-mono max-w-[200px]">
                {value.includes('ibb.co') ? 'ImgBB CDN' : value}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
