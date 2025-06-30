
import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { SearchFilters } from '@/components/SearchFilters';
import { IdeaList } from '@/components/IdeaList';
import { EmailSignup } from '@/components/EmailSignup';
import { Footer } from '@/components/Footer';
import { mockIdeas } from '@/data/mockIdeas';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  // Get all unique tags from ideas
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    mockIdeas.forEach(idea => idea.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort().slice(0, 8); // Show only first 8 tags for cleaner look
  }, []);

  // Filter ideas based on search and tags
  const filteredIdeas = useMemo(() => {
    return mockIdeas.filter(idea => {
      const matchesSearch = searchTerm === '' || 
        idea.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.mvpSuggestion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.targetUser.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => idea.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    });
  }, [searchTerm, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const toggleBookmark = (ideaId: string) => {
    setBookmarkedIds(prev => {
      const newBookmarks = prev.includes(ideaId) 
        ? prev.filter(id => id !== ideaId)
        : [...prev, ideaId];
      
      localStorage.setItem('promptmine-bookmarks', JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  };

  // Load bookmarks from localStorage on mount
  useState(() => {
    const saved = localStorage.getItem('promptmine-bookmarks');
    if (saved) {
      setBookmarkedIds(JSON.parse(saved));
    }
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <SearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedTags={selectedTags}
        allTags={allTags}
        onToggleTag={toggleTag}
        resultCount={filteredIdeas.length}
      />
      <IdeaList
        ideas={filteredIdeas}
        bookmarkedIds={bookmarkedIds}
        onToggleBookmark={toggleBookmark}
      />
      <EmailSignup />
      <Footer />
    </div>
  );
};

export default Index;
