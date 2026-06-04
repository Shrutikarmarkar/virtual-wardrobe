import type { Outfit } from '@/lib/types';
import { OutfitCard } from './OutfitCard';

export function OutfitGrid({ outfits }: { outfits: Outfit[] }) {
  if (outfits.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-muted-foreground">No outfits yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Tap the + button to add your first one.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {outfits.map((o) => (
        <OutfitCard key={o.id} outfit={o} />
      ))}
    </div>
  );
}
