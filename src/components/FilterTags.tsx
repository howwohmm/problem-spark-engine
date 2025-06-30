
import { Badge } from '@/components/ui/badge';

interface FilterTagsProps {
  allTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
}

export const FilterTags = ({ allTags, selectedTags, onToggleTag }: FilterTagsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {allTags.map((tag) => (
        <button
          key={tag}
          onClick={() => onToggleTag(tag)}
          className={`px-4 py-2 rounded-full text-sm font-normal transition-all border ${
            selectedTags.includes(tag)
              ? 'bg-accent text-foreground border-ring'
              : 'bg-background text-muted-foreground border-border hover:border-ring hover:text-foreground hover:bg-accent/50'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};
