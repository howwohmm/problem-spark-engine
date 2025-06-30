
import { Button } from '@/components/ui/button';

interface FilterActionsProps {
  resultCount: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export const FilterActions = ({ resultCount, hasActiveFilters, onClearFilters }: FilterActionsProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
      <div className="text-sm text-muted-foreground">
        {resultCount} {resultCount === 1 ? 'idea' : 'ideas'}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="h-8 text-muted-foreground hover:text-foreground text-sm"
          >
            Clear all
          </Button>
        )}
        <div className="hidden sm:block text-xs text-muted-foreground">
          ⌘K to search • ⌘D to toggle theme • ESC to clear filters
        </div>
      </div>
    </div>
  );
};
