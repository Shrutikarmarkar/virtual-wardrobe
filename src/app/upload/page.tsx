import Link from 'next/link';
import { UploadZone } from '@/components/UploadZone';

export default function UploadPage() {
  return (
    <div className="min-h-full flex flex-col">
      <header className="px-4 py-3 border-b border-border flex items-center gap-3 bg-white sticky top-0 z-10">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground min-h-11 inline-flex items-center"
        >
          ← Back
        </Link>
        <h1 className="text-base font-medium">New outfit</h1>
      </header>
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        <UploadZone />
      </main>
    </div>
  );
}
