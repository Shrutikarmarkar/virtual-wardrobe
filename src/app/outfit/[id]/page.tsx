import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase-server';
import { TagBadge } from '@/components/TagBadge';
import type { Outfit, Tag, TagCategory } from '@/lib/types';

const CATEGORY_ORDER: TagCategory[] = ['item', 'color', 'style', 'occasion', 'vibe'];

function groupTagsByCategory(tags: Tag[]): Record<TagCategory, Tag[]> {
  const out: Record<TagCategory, Tag[]> = {
    item: [],
    color: [],
    style: [],
    occasion: [],
    vibe: [],
  };
  for (const t of tags) {
    if (t.category in out) out[t.category].push(t);
  }
  return out;
}

export default async function OutfitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('outfits')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) notFound();
  const outfit = data as Outfit;
  const grouped = groupTagsByCategory(outfit.tags);

  return (
    <div className="min-h-full flex flex-col">
      <header className="px-4 py-3 border-b border-border flex items-center gap-3 bg-white sticky top-0 z-10">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground min-h-11 inline-flex items-center"
        >
          ← Back
        </Link>
      </header>
      <main className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-5">
        <div className="rounded-xl overflow-hidden bg-muted aspect-[3/4]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={outfit.image_url}
            alt={outfit.label}
            className="w-full h-full object-cover"
          />
        </div>

        <h1 className="text-2xl font-semibold">{outfit.label}</h1>

        {CATEGORY_ORDER.map((cat) => {
          const cTags = grouped[cat];
          if (cTags.length === 0) return null;
          return (
            <section key={cat}>
              <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                {cat}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {cTags.map((t, i) => (
                  <TagBadge key={`${cat}-${i}`} tag={t} />
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
