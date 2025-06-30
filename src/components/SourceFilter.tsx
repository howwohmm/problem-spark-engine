
import { Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';

interface SourceFilterProps {
  sourceFilter: string[];
  setSourceFilter: (sources: string[]) => void;
}

const sourceOptions = [
  { value: 'reddit', label: 'Reddit' },
  { value: 'hackernews', label: 'Hacker News' },
  { value: 'twitter', label: 'Twitter' }
];

export const SourceFilter = ({ sourceFilter, setSourceFilter }: SourceFilterProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
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

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setShowDropdown(!showDropdown)}
        className={`h-10 bg-background border-border hover:bg-accent ${
          sourceFilter.length > 0 ? 'text-foreground border-ring' : 'text-muted-foreground'
        }`}
      >
        <Filter className="mr-2 h-4 w-4" />
        Sources {sourceFilter.length > 0 && `(${sourceFilter.length})`}
        <ChevronDown className="ml-2 h-4 w-4" />
      </Button>
      
      {showDropdown && (
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
  );
};
