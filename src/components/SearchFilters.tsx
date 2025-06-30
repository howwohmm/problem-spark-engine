import { Search, Filter, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
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
const sortOptions = [{
  value: 'newest',
  label: 'Newest First'
}, {
  value: 'oldest',
  label: 'Oldest First'
}, {
  value: 'popular',
  label: 'Most Popular'
}];
const sourceOptions = [{
  value: 'reddit',
  label: 'Reddit'
}, {
  value: 'hackernews',
  label: 'Hacker News'
}, {
  value: 'twitter',
  label: 'Twitter'
}];
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
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const sourceDropdownRef = useRef<HTMLDivElement>(null);

  // Focus search input when Cmd+K is pressed (handled by parent)
  useEffect(() => {
    const handleFocusSearch = () => {
      searchInputRef.current?.focus();
    };
    window.addEventListener('focusSearch', handleFocusSearch);
    return () => window.removeEventListener('focusSearch', handleFocusSearch);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
      if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(event.target as Node)) {
        setShowSourceDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const toggleSource = (source: string) => {
    const updated = sourceFilter.includes(source) ? sourceFilter.filter(s => s !== source) : [...sourceFilter, source];
    setSourceFilter(updated);
  };
  const clearAllFilters = () => {
    setSearchTerm('');
    onToggleTag(''); // This will clear selected tags
    setSourceFilter([]);
  };
  const hasActiveFilters = searchTerm || selectedTags.length > 0 || sourceFilter.length > 0;
  return <section className="px-6 py-12 max-w-7xl mx-auto border-t border-gray-100 dark:border-gray-800 transition-colors bg-zinc-900">
      <div className="space-y-8">
        {/* Search */}
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
            <Input ref={searchInputRef} placeholder="Search ideas... (⌘K)" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-11 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-gray-400 dark:focus:border-gray-500 focus:ring-0 h-12" />
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Sort Dropdown */}
          <div className="relative" ref={sortDropdownRef}>
            <Button variant="outline" onClick={() => setShowSortDropdown(!showSortDropdown)} className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500">
              {sortOptions.find(opt => opt.value === sortBy)?.label || 'Sort'}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            
            {showSortDropdown && <div className="absolute top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                {sortOptions.map(option => <button key={option.value} onClick={() => {
              setSortBy(option.value);
              setShowSortDropdown(false);
            }} className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${sortBy === option.value ? 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {option.label}
                  </button>)}
              </div>}
          </div>

          {/* Source Filter Dropdown */}
          <div className="relative" ref={sourceDropdownRef}>
            <Button variant="outline" onClick={() => setShowSourceDropdown(!showSourceDropdown)} className={`border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 ${sourceFilter.length > 0 ? 'text-gray-900 dark:text-white border-gray-400 dark:border-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
              <Filter className="mr-2 h-4 w-4" />
              Sources {sourceFilter.length > 0 && `(${sourceFilter.length})`}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            
            {showSourceDropdown && <div className="absolute top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                {sourceOptions.map(option => <button key={option.value} onClick={() => toggleSource(option.value)} className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${sourceFilter.includes(option.value) ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    {option.label}
                  </button>)}
              </div>}
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && <Button variant="ghost" onClick={clearAllFilters} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              Clear all
            </Button>}
        </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => <Badge key={tag} variant="outline" className={`cursor-pointer transition-all text-sm font-light px-4 py-2 ${selectedTags.includes(tag) ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'}`} onClick={() => onToggleTag(tag)}>
              {tag}
            </Badge>)}
        </div>

        {/* Results count and keyboard shortcuts hint */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400 dark:text-gray-500 font-light">
            {resultCount} {resultCount === 1 ? 'idea' : 'ideas'}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 font-light">
            ⌘K to search • ⌘D to toggle theme • ESC to clear filters
          </div>
        </div>
      </div>
    </section>;
};