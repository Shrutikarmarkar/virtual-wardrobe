'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { OUTFITS_BUCKET, supabase } from '@/lib/supabase';
import { fileToBase64 } from '@/lib/file';
import type { Tag, TagResponse } from '@/lib/types';
import { TagBadge } from './TagBadge';

type Step = 'pick' | 'analyzing' | 'tagged' | 'saving';

export function UploadZone() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [step, setStep] = useState<Step>('pick');
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setFile(null);
    setPreview(null);
    setLabel('');
    setTags([]);
    setStep('pick');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleFile(f: File) {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStep('analyzing');
    setError(null);
    try {
      const base64 = await fileToBase64(f);
      const res = await fetch('/api/tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: f.type }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Tagging failed');
      }
      const data = (await res.json()) as TagResponse;
      setLabel(data.label);
      setTags(data.tags ?? []);
      setStep('tagged');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
      setStep('pick');
    }
  }

  async function save() {
    if (!file) return;
    setStep('saving');
    setError(null);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(OUTFITS_BUCKET)
        .upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      const {
        data: { publicUrl },
      } = supabase.storage.from(OUTFITS_BUCKET).getPublicUrl(path);

      const res = await fetch('/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: publicUrl, label: label || 'My outfit', tags }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Save failed');
      }
      const outfit = await res.json();
      router.push(`/outfit/${outfit.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save outfit');
      setStep('tagged');
    }
  }

  function removeTag(idx: number) {
    setTags((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-4">
      {step === 'pick' && (
        <label
          htmlFor="outfit-file"
          className="block cursor-pointer border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-accent hover:bg-muted/50 transition"
        >
          <p className="text-sm font-medium text-foreground">Tap to take a photo</p>
          <p className="text-xs text-muted-foreground mt-1">or upload from your library</p>
        </label>
      )}

      <input
        id="outfit-file"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
        className="hidden"
      />

      {preview && (
        <div className="rounded-xl overflow-hidden bg-muted aspect-[3/4]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Outfit preview" className="w-full h-full object-cover" />
        </div>
      )}

      {step === 'analyzing' && (
        <div className="text-center text-sm text-muted-foreground py-4">
          Analyzing your outfit…
        </div>
      )}

      {(step === 'tagged' || step === 'saving') && (
        <>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground" htmlFor="label-input">
              Label
            </label>
            <input
              id="label-input"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Tags ({tags.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t, i) => (
                <TagBadge key={`${t.category}-${i}`} tag={t} onRemove={() => removeTag(i)} />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={reset}
              disabled={step === 'saving'}
              className="flex-1 px-4 py-3 rounded-lg border border-border bg-white text-sm font-medium hover:bg-muted disabled:opacity-50 min-h-11"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={save}
              disabled={step === 'saving'}
              className="flex-1 px-4 py-3 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 min-h-11"
            >
              {step === 'saving' ? 'Saving…' : 'Save outfit'}
            </button>
          </div>
        </>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
