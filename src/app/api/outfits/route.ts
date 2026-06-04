import { NextRequest } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import type { Outfit, Tag } from '@/lib/types';

export async function GET(req: NextRequest) {
  const supabase = createServerSupabase();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim().toLowerCase() ?? '';
  const tagParam = searchParams.get('tags') ?? '';
  const tagValues = tagParam
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const { data, error } = await supabase
    .from('outfits')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[api/outfits] GET error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  let outfits = (data ?? []) as Outfit[];

  if (q) {
    outfits = outfits.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.tags.some((t) => t.value.toLowerCase().includes(q)),
    );
  }

  if (tagValues.length > 0) {
    outfits = outfits.filter((o) =>
      o.tags.some((t) => {
        const v = t.value.toLowerCase();
        return tagValues.some((tv) => v.includes(tv) || tv.includes(v));
      }),
    );
  }

  return Response.json(outfits);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      image_url?: string;
      label?: string;
      tags?: Tag[];
    };

    if (!body.image_url || !body.label) {
      return Response.json(
        { error: 'Missing image_url or label' },
        { status: 400 },
      );
    }

    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from('outfits')
      .insert({
        image_url: body.image_url,
        label: body.label,
        tags: body.tags ?? [],
      })
      .select()
      .single();

    if (error) {
      console.error('[api/outfits] POST error', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
  } catch (err) {
    console.error('[api/outfits] POST exception', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: msg }, { status: 500 });
  }
}
