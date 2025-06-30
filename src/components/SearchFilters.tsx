
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTags: string[];
  allTags: string[];
  onToggleTag: (tag: string) => void;
  resultCount: number;
}

export const SearchFilters = ({
  searchTerm,
  setSearchTerm,
  selectedTags,
  allTags,
  onToggleTag,
  resultCount
}: SearchFiltersProps) => {
  return (
    <section className="px-6 py-12 max-w-7xl mx-auto border-t border-gray-100">
      <div className="space-y-8">
        {/* Search */}
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search ideas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-0 h-12"
            />
          </div>
        </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <Badge
              key={tag}
              variant="outline"
              className={`cursor-pointer transition-all text-sm font-light px-4 py-2 ${
                selectedTags.includes(tag)
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
              onClick={() => onToggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-400 font-light">
          {resultCount} {resultCount === 1 ? 'idea' : 'ideas'}
        </div>
      </div>
    </section>
  );
};
