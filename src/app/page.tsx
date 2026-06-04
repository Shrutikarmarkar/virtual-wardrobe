'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { OutfitGrid } from '@/components/OutfitGrid';
import { SearchBar } from '@/components/SearchBar';
import type { Outfit, Tag } from '@/lib/types';

function filterOutfits(outfits: Outfit[], query: string, photoTags: Tag[]): Outfit[] {
  let result = outfits;
  const q = query.trim().toLowerCase();

  if (q) {
    result = result.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.tags.some((t) => t.value.toLowerCase().includes(q)),
    );
  }

  if (photoTags.length > 0) {
    const needles = photoTags.map((t) => t.value.toLowerCase());
    result = result.filter((o) =>
      o.tags.some((t) => {
        const v = t.value.toLowerCase();
        return needles.some((n) => v.includes(n) || n.includes(v));
      }),
    );
  }

  return result;
}

export default function HomePage() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [photoTags, setPhotoTags] = useState<Tag[]>([]);

  useEffect(() => {
    let alive = true;
    fetch('/api/outfits')
      .then((r) => r.json())
      .then((data) => {
        if (alive) setOutfits(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error('failed to load outfits', err))
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(
    () => filterOutfits(outfits, query, photoTags),
    [outfits, query, photoTags],
  );

  return (
    <div className="min-h-full flex flex-col">
      <header className="px-4 py-3 border-b border-border bg-white sticky top-0 z-10">
        <h1 className="text-lg font-semibold">Virtual Wardrobe</h1>
        <p className="text-xs text-muted-foreground">
          {outfits.length} outfit{outfits.length === 1 ? '' : 's'}
        </p>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 space-y-4 pb-28">
        <SearchBar onTextChange={setQuery} onTagsFromImage={setPhotoTags} />

        {photoTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Matching:</span>
            <span className="text-foreground">
              {photoTags.map((t) => t.value).join(', ')}
            </span>
            <button
              type="button"
              onClick={() => setPhotoTags([])}
              className="ml-auto text-accent hover:underline"
            >
              Clear
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-sm text-muted-foreground">Loading…</div>
        ) : (
          <OutfitGrid outfits={filtered} />
        )}
      </main>

      <Link
        href="/upload"
        aria-label="Add outfit"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center text-3xl font-light hover:scale-105 active:scale-95 transition"
      >
        +
      </Link>
    </div>
  );
}
