import { useState, useMemo, useRef } from 'react';
import { HeroSection } from '@/components/HeroSection';
import { SearchFilters } from '@/components/SearchFilters';
import { IdeaList } from '@/components/IdeaList';
import { EmailSignup } from '@/components/EmailSignup';
import { Footer } from '@/components/Footer';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTheme } from '@/contexts/ThemeContext';
import { useBookmarks } from '@/contexts/BookmarkContext';
import { mockIdeas } from '@/data/mockIdeas'; // Import mock data

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);
  
  const { toggleTheme } = useTheme();
  const { bookmarkedIds, toggleBookmark } = useBookmarks();
  const { data: ideas = [], isLoading, error } = { data: mockIdeas, isLoading: false, error: null }; // Use mock data

  // Get all unique tags from ideas
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    ideas.forEach(idea => idea.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort().slice(0, 8); // Show only first 8 tags for cleaner look
  }, [ideas]);

  // Filter and sort ideas
  const filteredAndSortedIdeas = useMemo(() => {
    let filtered = ideas.filter(idea => {
      const matchesSearch = searchTerm === '' || 
        idea.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.mvpSuggestion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.targetUser.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => idea.tags.includes(tag));
      
      const matchesSource = sourceFilter.length === 0 ||
        sourceFilter.includes(idea.sourceType);
      
      return matchesSearch && matchesTags && matchesSource;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case 'popular':
          // For now, sort by number of tags as a proxy for popularity
          return b.tags.length - a.tags.length;
        case 'newest':
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });

    return filtered;
  }, [ideas, searchTerm, selectedTags, sourceFilter, sortBy]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setSourceFilter([]);
  };

  const focusSearch = () => {
    window.dispatchEvent(new Event('focusSearch'));
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSearch: focusSearch,
    onToggleTheme: toggleTheme,
    onClearFilters: clearFilters
  });

  if (error) {
    console.error('Error loading ideas:', error);
  }

  return (
    <div className="min-h-screen bg-background transition-colors">
      <div className="w-full px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-none">
          <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-3 sm:mb-4">
            Ideas
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl">
            Turn community noise into build-ready ideas
          </p>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-12 max-w-3xl">
            We scan Reddit, Hacker News, and other communities to surface real problems people are discussing.
          </p>
        </div>
      </div>
      <SearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedTags={selectedTags}
        allTags={allTags}
        onToggleTag={toggleTag}
        resultCount={filteredAndSortedIdeas.length}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sourceFilter={sourceFilter}
        setSourceFilter={setSourceFilter}
      />
      <div className="w-full px-4 sm:px-6">
        {isLoading ? (
          <div className="w-full py-16 sm:py-24 bg-background">
            <div className="text-left">
              <p className="text-muted-foreground text-base sm:text-lg">Loading ideas...</p>
            </div>
          </div>
        ) : (
          <IdeaList
            ideas={filteredAndSortedIdeas}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={toggleBookmark}
          />
        )}
      </div>
      <div className="w-full px-4 sm:px-6">
        <EmailSignup />
      </div>
      <div className="w-full px-4 sm:px-6">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
