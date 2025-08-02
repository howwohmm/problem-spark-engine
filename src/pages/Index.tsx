
import { useState, useMemo, useEffect } from 'react';
import { SearchFilters } from '@/components/SearchFilters';
import { IdeaList } from '@/components/IdeaList';
import { EmailSignup } from '@/components/EmailSignup';
import { Footer } from '@/components/Footer';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTheme } from '@/contexts/ThemeContext';
import { useBookmarks } from '@/contexts/BookmarkContext';
import { apiService, type ApiIdea } from '@/services/apiService';
import { mockIdeas } from '@/data/mockIdeas';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);
  const [ideas, setIdeas] = useState<ApiIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { toggleTheme } = useTheme();
  const { bookmarkedIds, toggleBookmark } = useBookmarks();
  
  // Fetch ideas from Supabase, fallback to mock data
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        setLoading(true);
        const response = await apiService.fetchIdeas({
          sortBy: sortBy as 'newest' | 'oldest' | 'popular'
        });
        
        // Transform the data to match the expected format
        const transformedIdeas = response.ideas.map(idea => ({
          ...idea,
          targetUser: idea.target_user,
          mvpSuggestion: idea.mvp_suggestion,
          source: idea.source_url,
          sourceType: idea.source_platform,
          timestamp: idea.created_at,
          confidence: idea.confidence_score
        }));
        
        setIdeas(transformedIdeas);
        setError(null);
      } catch (err) {
        console.warn('Supabase failed, using mock data:', err);
        setIdeas(mockIdeas as ApiIdea[]);
        setError('Using demo data - Database connection failed');
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, [sortBy]);

  // Get all unique tags from ideas
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    ideas.forEach(idea => idea.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort().slice(0, 8);
  }, [ideas]);

  // Filter and sort ideas
  const filteredAndSortedIdeas = useMemo(() => {
    let filtered = ideas.filter(idea => {
      const matchesSearch = searchTerm === '' || 
        idea.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (idea.mvp_suggestion || idea.mvpSuggestion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (idea.target_user || idea.targetUser || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => idea.tags.includes(tag));
      
      const matchesSource = sourceFilter.length === 0 ||
        sourceFilter.includes(idea.source_platform || idea.sourceType);
      
      return matchesSearch && matchesTags && matchesSource;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at || a.timestamp).getTime() - new Date(b.created_at || b.timestamp).getTime();
        case 'popular':
          return (b.confidence_score || b.confidence || 0) - (a.confidence_score || a.confidence || 0);
        case 'newest':
        default:
          return new Date(b.created_at || b.timestamp).getTime() - new Date(a.created_at || a.timestamp).getTime();
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

  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Hero Section */}
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

      {/* Search and Filters */}
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

      {/* Ideas List */}
      <div className="w-full px-4 sm:px-6">
        {loading ? (
          <div className="text-center py-8">Loading ideas...</div>
        ) : error ? (
          <div className="text-center py-8 text-yellow-600">{error}</div>
        ) : (
          <IdeaList 
            ideas={filteredAndSortedIdeas.map(idea => ({
              id: idea.id,
              problem: idea.problem,
              targetUser: idea.target_user || idea.targetUser || '',
              mvpSuggestion: idea.mvp_suggestion || idea.mvpSuggestion || '',
              source: idea.source_url || idea.source || '',
              sourceType: idea.source_platform || idea.sourceType,
              tags: idea.tags,
              timestamp: idea.created_at || idea.timestamp
            }))}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={toggleBookmark}
          />
        )}
      </div>

      {/* Email Signup */}
      <div className="w-full px-4 sm:px-6">
        <EmailSignup />
      </div>

      {/* Footer */}
      <div className="w-full px-4 sm:px-6">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
