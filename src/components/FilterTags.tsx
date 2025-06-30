
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
        <Badge
          key={tag}
          variant="outline"
          className={`cursor-pointer transition-all text-xs px-3 py-1 ${
            selectedTags.includes(tag)
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-muted-foreground border-border hover:border-ring hover:text-foreground'
          }`}
          onClick={() => onToggleTag(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
};
