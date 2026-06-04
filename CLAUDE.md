# Virtual Wardrobe — Claude Code Guide

## What this app is
A virtual wardrobe app where users photograph outfits and the app automatically tags every clothing item using Claude Vision. Later, users can describe a top or upload a reference photo and the app surfaces how they previously styled it. Minimal effort from the user — photo in, fully tagged outfit saved.

## Build status
- ✅ Lib layer done: `src/lib/types.ts`, `src/lib/supabase.ts`, `src/lib/supabase-server.ts`, `src/lib/claude.ts`, `src/lib/file.ts`
- ✅ Components done: `TagBadge`, `OutfitCard`, `OutfitGrid`, `SearchBar`, `UploadZone`
- ✅ API routes done: `/api/tag`, `/api/outfits`
- ✅ Pages done: homepage grid, `/upload`, `/outfit/[id]`
- ⏳ Pending: link Vercel project + provision Supabase via Marketplace, run SQL schema, create `outfits` storage bucket, smoke test end-to-end

## Current phase
**Phase 1 — core loop (build this first)**
- Photo upload (camera on mobile, file picker on desktop)
- Claude Vision auto-tags the outfit (items, colors, style, occasion, vibe)
- Outfit saved to Supabase (image in storage, tags in database)
- Homepage grid showing all saved outfits with their tags
- Search: describe an item in text OR upload a reference photo → returns matching past outfits

## Tech stack
- **Framework**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Database + Storage**: Supabase (postgres + image storage buckets)
- **AI**: Anthropic Claude Vision API (`claude-sonnet-4-20250514`) for auto-tagging
- **Hosting target**: Vercel (keep this in mind — no Node-only APIs in route handlers)
- **Mobile**: PWA-ready from day one (add manifest + service worker later)

## Project structure
```
src/
  app/
    page.tsx               # Homepage — outfit grid
    upload/
      page.tsx             # Upload flow
    outfit/[id]/
      page.tsx             # Outfit detail page
    api/
      tag/
        route.ts           # POST: receives image, calls Claude Vision, returns tags
      outfits/
        route.ts           # GET: fetch all outfits. POST: save new outfit
  components/
    OutfitGrid.tsx         # Masonry/grid of outfit cards
    OutfitCard.tsx         # Single outfit card with tags
    UploadZone.tsx         # Drag-drop + camera capture component
    TagBadge.tsx           # Pill badge for a single tag
    SearchBar.tsx          # Text + image search input
  lib/
    supabase.ts            # Supabase client (browser)
    supabase-server.ts     # Supabase client (server/route handlers)
    claude.ts              # Anthropic client + tagging function
    types.ts               # Shared TypeScript types
```

## Shared TypeScript types (src/lib/types.ts)
```ts
export type Outfit = {
  id: string
  image_url: string
  label: string           // short name user gives or AI suggests
  tags: Tag[]
  created_at: string
}

export type Tag = {
  category: 'item' | 'color' | 'style' | 'occasion' | 'vibe'
  value: string           // e.g. "white linen shirt", "casual", "summer"
}
```

## Supabase schema — run this in the SQL editor
Phase 1 is single-user, so no `user_id` and no RLS. Multi-user + auth come in Phase 2.

```sql
create table outfits (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  label text not null default 'My outfit',
  tags jsonb not null default '[]',
  created_at timestamptz not null default now()
);
```

Also create a Supabase Storage bucket called `outfits` — set it to public.

## Claude Vision tagging — how it works (src/app/api/tag/route.ts)
```ts
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: Request) {
  const { imageBase64, mimeType } = await req.json()

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mimeType, data: imageBase64 }
        },
        {
          type: 'text',
          text: `Analyze this outfit photo and return a JSON object with this exact shape:
{
  "label": "short evocative name for this outfit (max 4 words, e.g. 'Sunday brunch fit')",
  "tags": [
    { "category": "item", "value": "white linen shirt" },
    { "category": "item", "value": "wide-leg cream trousers" },
    { "category": "color", "value": "neutral tones" },
    { "category": "style", "value": "quiet luxury" },
    { "category": "occasion", "value": "brunch" },
    { "category": "vibe", "value": "effortless" }
  ]
}

Rules:
- List every visible clothing item, accessory, and shoe as an "item" tag
- Include dominant colors as "color" tags
- Include style descriptors (e.g. streetwear, minimalist, Y2K, coastal grandmother) as "style" tags
- Include occasion (e.g. work, casual, date night, gym) as "occasion" tags  
- Include overall vibe (1-2 words) as a "vibe" tag
- Return ONLY the JSON object, no markdown, no explanation`
        }
      ]
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const parsed = JSON.parse(text)
  return Response.json(parsed)
}
```

## Environment variables needed (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
```

## Design system
- **Color palette**: neutral base (white, off-white, warm grays) with purple accent (`#534AB7`) for interactive elements
- **Font**: system-ui / Inter — clean and fast
- **Cards**: white background, `rounded-xl`, `border border-gray-100`, generous padding
- **Tags/pills**: small, rounded-full, muted gray background, tight padding
- **Upload button**: large floating action button (FAB), purple, bottom-right on mobile
- **Mobile first**: design for 390px wide, then scale up. Touch targets min 44px.
- **No dark mode yet** — keep it light and simple for Phase 1

## Key UX rules (enforce these throughout)
1. User does the MINIMUM — one tap to open camera, one tap to confirm. AI does the rest.
2. Tags appear immediately in a preview before saving — user can delete wrong tags but rarely needs to.
3. Search works two ways: type a description ("that black cargo pant outfit") OR upload a photo of a single item to find outfits it appeared in.
4. Outfit cards show the photo + top 3 tags only. Full detail on tap.
5. The app must work on mobile phone browsers without any install — PWA later, but core flow works in Safari/Chrome mobile today.

## What NOT to build yet (Phase 2+)
- User auth / login (build Phase 1 without auth, single user mode)
- Social features / sharing
- Wear tracking / outfit calendar
- AI outfit suggestions
- Push notifications

## Packages to install
```bash
npm install @supabase/supabase-js @supabase/ssr @anthropic-ai/sdk
```

## How to run
```bash
npm run dev     # localhost:3000
```

## When you get stuck
- Supabase storage upload errors → check bucket is set to public and RLS is off on storage for now
- Claude API image errors → ensure base64 string has no `data:image/...;base64,` prefix — strip it before sending
- Tailwind not applying → check `tailwind.config.ts` includes `./src/**/*.{ts,tsx}`
- Next.js App Router fetch issues → route handlers must export named functions `GET`, `POST` etc.
