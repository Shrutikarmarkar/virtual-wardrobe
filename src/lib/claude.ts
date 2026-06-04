import Anthropic from '@anthropic-ai/sdk';
import type { TagResponse } from './types';

const client = new Anthropic();

const TAG_MODEL = 'claude-sonnet-4-20250514';

const TAGGING_PROMPT = `Analyze this outfit photo and return a JSON object with this exact shape:
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
- Return ONLY the JSON object, no markdown, no explanation`;

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

export async function tagOutfit(
  imageBase64: string,
  mimeType: ImageMediaType,
): Promise<TagResponse> {
  const response = await client.messages.create({
    model: TAG_MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mimeType, data: imageBase64 },
          },
          { type: 'text', text: TAGGING_PROMPT },
        ],
      },
    ],
  });

  const block = response.content[0];
  const text = block.type === 'text' ? block.text : '';
  return JSON.parse(text) as TagResponse;
}
