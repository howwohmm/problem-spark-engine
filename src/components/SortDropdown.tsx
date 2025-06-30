
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';

interface SortDropdownProps {
  sortBy: string;
  setSortBy: (sort: string) => void;
}

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' }
];

export const SortDropdown = ({ sortBy, setSortBy }: SortDropdownProps) => {
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

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setShowDropdown(!showDropdown)}
        className="h-9 px-4 rounded-full bg-background border-border hover:bg-accent text-foreground text-sm font-normal"
      >
        {sortOptions.find(opt => opt.value === sortBy)?.label || 'Sort'}
        <ChevronDown className="ml-2 h-4 w-4" />
      </Button>
      
      {showDropdown && (
        <div className="absolute top-full mt-2 w-48 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSortBy(option.value);
                setShowDropdown(false);
              }}
              className={`w-full text-left px-4 py-3 hover:bg-accent transition-colors text-sm ${
                sortBy === option.value ? 'bg-accent text-foreground font-medium' : 'text-muted-foreground'
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
