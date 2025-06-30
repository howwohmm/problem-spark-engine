
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRef, useEffect } from 'react';

interface SearchInputProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const SearchInput = ({ searchTerm, setSearchTerm }: SearchInputProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleFocusSearch = () => {
      searchInputRef.current?.focus();
    };
    window.addEventListener('focusSearch', handleFocusSearch);
    return () => window.removeEventListener('focusSearch', handleFocusSearch);
  }, []);

  return (
    <div className="w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={searchInputRef}
          placeholder="Search ideas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-10 bg-background border-border focus:border-ring focus:ring-1 focus:ring-ring w-full"
        />
      </div>
    </div>
  );
};
