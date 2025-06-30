
import { SearchInput } from '@/components/SearchInput';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SortDropdown } from '@/components/SortDropdown';
import { SourceFilter } from '@/components/SourceFilter';
import { FilterTags } from '@/components/FilterTags';
import { FilterActions } from '@/components/FilterActions';

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTags: string[];
  allTags: string[];
  onToggleTag: (tag: string) => void;
  resultCount: number;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sourceFilter: string[];
  setSourceFilter: (sources: string[]) => void;
}

export const SearchFilters = ({
  searchTerm,
  setSearchTerm,
  selectedTags,
  allTags,
  onToggleTag,
  resultCount,
  sortBy,
  setSortBy,
  sourceFilter,
  setSourceFilter
}: SearchFiltersProps) => {
  const clearAllFilters = () => {
    setSearchTerm('');
    selectedTags.forEach(tag => onToggleTag(tag));
    setSourceFilter([]);
  };

  const hasActiveFilters = searchTerm || selectedTags.length > 0 || sourceFilter.length > 0;

  return (
    <section className="w-full px-6 py-8 bg-background border-t border-border">
      <div className="max-w-none space-y-6">
        {/* Search and Theme Toggle Row */}
        <div className="flex items-center justify-between">
          <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <ThemeToggle />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />
          <SourceFilter sourceFilter={sourceFilter} setSourceFilter={setSourceFilter} />
        </div>

        {/* Filter Tags */}
        <FilterTags 
          allTags={allTags} 
          selectedTags={selectedTags} 
          onToggleTag={onToggleTag} 
        />

        {/* Results count and shortcuts */}
        <FilterActions 
          resultCount={resultCount}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearAllFilters}
        />
      </div>
    </section>
  );
};
