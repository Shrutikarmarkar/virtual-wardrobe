import Link from 'next/link';
import type { Outfit } from '@/lib/types';
import { TagBadge } from './TagBadge';

export function OutfitCard({ outfit }: { outfit: Outfit }) {
  const topTags = outfit.tags.slice(0, 3);
  return (
    <Link
      href={`/outfit/${outfit.id}`}
      className="group block bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition"
    >
      <div className="relative aspect-[3/4] bg-muted overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={outfit.image_url}
          alt={outfit.label}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
        />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium truncate text-foreground">{outfit.label}</h3>
        <div className="mt-2 flex flex-wrap gap-1">
          {topTags.map((t, i) => (
            <TagBadge key={`${t.category}-${i}`} tag={t} />
          ))}
        </div>
      </div>
    </Link>
  );
}
