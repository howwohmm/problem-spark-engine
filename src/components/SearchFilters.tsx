import { Search, Filter, ChevronDown, Sun, Moon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

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

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' }
];

const sourceOptions = [
  { value: 'reddit', label: 'Reddit' },
  { value: 'hackernews', label: 'Hacker News' },
  { value: 'twitter', label: 'Twitter' }
];

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
  
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleFocusSearch = () => {
      searchInputRef.current?.focus();
    };
    window.addEventListener('focusSearch', handleFocusSearch);
    return () => window.removeEventListener('focusSearch', handleFocusSearch);
  }, []);

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
    const updated = sourceFilter.includes(source) 
      ? sourceFilter.filter(s => s !== source) 
      : [...sourceFilter, source];
    setSourceFilter(updated);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    onToggleTag('');
    setSourceFilter([]);
  };

  const hasActiveFilters = searchTerm || selectedTags.length > 0 || sourceFilter.length > 0;

  return (
    <section className="max-w-4xl mx-auto px-6 py-8 bg-background border-t border-border">
      <div className="space-y-6">
        {/* Search and Theme Toggle Row */}
        <div className="flex items-center justify-between">
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                ref={searchInputRef}
                placeholder="Search ideas... (⌘K)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-background border-border focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sort Dropdown */}
          <div className="relative" ref={sortDropdownRef}>
            <Button
              variant="outline"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="h-10 bg-background border-border hover:bg-accent"
            >
              {sortOptions.find(opt => opt.value === sortBy)?.label || 'Sort'}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            
            {showSortDropdown && (
              <div className="absolute top-full mt-1 w-48 bg-background border border-border rounded-md shadow-lg z-50">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-accent transition-colors text-sm ${
                      sortBy === option.value ? 'bg-accent text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Source Filter Dropdown */}
          <div className="relative" ref={sourceDropdownRef}>
            <Button
              variant="outline"
              onClick={() => setShowSourceDropdown(!showSourceDropdown)}
              className={`h-10 bg-background border-border hover:bg-accent ${
                sourceFilter.length > 0 ? 'text-foreground border-ring' : 'text-muted-foreground'
              }`}
            >
              <Filter className="mr-2 h-4 w-4" />
              Sources {sourceFilter.length > 0 && `(${sourceFilter.length})`}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            
            {showSourceDropdown && (
              <div className="absolute top-full mt-1 w-48 bg-background border border-border rounded-md shadow-lg z-50">
                {sourceOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleSource(option.value)}
                    className={`w-full text-left px-3 py-2 hover:bg-accent transition-colors text-sm ${
                      sourceFilter.includes(option.value) ? 'bg-accent text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearAllFilters}
              className="h-10 text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Filter Tags */}
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

        {/* Results count and shortcuts */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-muted-foreground">
            {resultCount} {resultCount === 1 ? 'idea' : 'ideas'}
          </div>
          <div className="text-xs text-muted-foreground">
            ⌘K to search • ⌘D to toggle theme • ESC to clear filters
          </div>
        </div>
      </div>
    </section>
  );
};
