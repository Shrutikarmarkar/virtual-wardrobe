import { NextRequest } from 'next/server';
import { tagOutfit } from '@/lib/claude';

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

const ALLOWED_MIME: ReadonlySet<string> = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = (await req.json()) as {
      imageBase64?: string;
      mimeType?: string;
    };

    if (!imageBase64 || !mimeType) {
      return Response.json({ error: 'Missing imageBase64 or mimeType' }, { status: 400 });
    }
    if (!ALLOWED_MIME.has(mimeType)) {
      return Response.json({ error: `Unsupported mimeType: ${mimeType}` }, { status: 400 });
    }

    const result = await tagOutfit(imageBase64, mimeType as ImageMediaType);
    return Response.json(result);
  } catch (err) {
    console.error('[api/tag] error', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: msg }, { status: 500 });
  }
}
