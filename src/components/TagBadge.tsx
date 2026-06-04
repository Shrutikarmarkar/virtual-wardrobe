import type { Tag } from '@/lib/types';

type Props = {
  tag: Tag;
  onRemove?: () => void;
};

export function TagBadge({ tag, onRemove }: Props) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
      {tag.value}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${tag.value}`}
          className="ml-0.5 -mr-1 w-4 h-4 rounded-full leading-none flex items-center justify-center text-base hover:bg-gray-200 hover:text-foreground"
        >
          ×
        </button>
      )}
    </span>
  );
}
