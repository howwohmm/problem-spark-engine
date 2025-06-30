
import { useState, useMemo, useRef } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { SearchFilters } from '@/components/SearchFilters';
import { IdeaList } from '@/components/IdeaList';
import { EmailSignup } from '@/components/EmailSignup';
import { Footer } from '@/components/Footer';
import { mockIdeas } from '@/data/mockIdeas';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTheme } from '@/contexts/ThemeContext';
import { useBookmarks } from '@/contexts/BookmarkContext';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);
  
  const { toggleTheme } = useTheme();
  const { bookmarkedIds, toggleBookmark } = useBookmarks();

  // Get all unique tags from ideas
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    mockIdeas.forEach(idea => idea.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort().slice(0, 8); // Show only first 8 tags for cleaner look
  }, []);

  // Filter and sort ideas
  const filteredAndSortedIdeas = useMemo(() => {
    let filtered = mockIdeas.filter(idea => {
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
  }, [searchTerm, selectedTags, sourceFilter, sortBy]);

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

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Header />
      <HeroSection />
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
      <IdeaList
        ideas={filteredAndSortedIdeas}
        bookmarkedIds={bookmarkedIds}
        onToggleBookmark={toggleBookmark}
      />
      <EmailSignup />
      <Footer />
    </div>
  );
};

export default Index;
