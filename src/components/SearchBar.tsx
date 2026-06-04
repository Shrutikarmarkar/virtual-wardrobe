'use client';

import { useRef, useState } from 'react';
import { fileToBase64 } from '@/lib/file';
import type { Tag, TagResponse } from '@/lib/types';

type Props = {
  onTextChange: (text: string) => void;
  onTagsFromImage: (tags: Tag[]) => void;
};

export function SearchBar({ onTextChange, onTagsFromImage }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analyzing, setAnalyzing] = useState(false);

  async function handlePhotoSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalyzing(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
      });
      if (!res.ok) throw new Error('Tagging failed');
      const data = (await res.json()) as TagResponse;
      onTagsFromImage(data.tags ?? []);
    } catch (err) {
      console.error('photo search failed', err);
    } finally {
      setAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="flex gap-2">
      <input
        type="search"
        placeholder="Search outfits, items, colors…"
        onChange={(e) => onTextChange(e.target.value)}
        className="flex-1 px-3 py-2 rounded-lg border border-border bg-white text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoSearch}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={analyzing}
        aria-label="Search by photo"
        className="min-w-11 px-3 py-2 rounded-lg border border-border bg-white text-xs font-medium hover:bg-muted disabled:opacity-50"
      >
        {analyzing ? '…' : 'Photo'}
      </button>
    </div>
  );
}
