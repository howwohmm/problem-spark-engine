
import { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { EmailSignup } from '@/components/EmailSignup';
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
      
      {/* Hero Section - More minimal and spacious */}
      <section className="px-6 py-24 max-w-4xl mx-auto">
        <h1 className="text-5xl font-light mb-8 text-gray-900 tracking-tight">
          Ideas
        </h1>
        <p className="text-xl text-gray-600 mb-6 font-light leading-relaxed max-w-2xl">
          Turn community noise into build-ready ideas
        </p>
        <p className="text-gray-500 max-w-xl leading-relaxed">
          We scan Reddit, Hacker News, and other communities to surface real problems 
          people are discussing.
        </p>
      </section>

      {/* Search and Filters - Cleaner approach */}
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

          {/* Filter Tags - More minimal */}
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
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Results count - subtle */}
          <div className="text-sm text-gray-400 font-light">
            {filteredIdeas.length} {filteredIdeas.length === 1 ? 'idea' : 'ideas'}
          </div>
        </div>
      </section>

      {/* Ideas List - Much cleaner table */}
      <section className="px-6 pb-24 max-w-7xl mx-auto">
        <div className="space-y-0">
          {filteredIdeas.map((idea, index) => (
            <div 
              key={idea.id} 
              className="py-12 border-b border-gray-100 last:border-b-0 group"
            >
              <div className="grid grid-cols-12 gap-8 items-start">
                {/* Date - smaller and subtle */}
                <div className="col-span-2">
                  <div className="text-sm text-gray-400 font-light">
                    {idea.timestamp}
                  </div>
                </div>

                {/* Main Content - more space */}
                <div className="col-span-9 space-y-6">
                  {/* Problem */}
                  <div>
                    <h3 className="text-xl font-light text-gray-900 leading-relaxed mb-3">
                      {idea.problem}
                    </h3>
                    <p className="text-gray-600 leading-relaxed font-light">
                      {idea.mvpSuggestion}
                    </p>
                  </div>
                  
                  {/* Target User */}
                  <div>
                    <p className="text-gray-500 font-light leading-relaxed">
                      <span className="text-gray-400 text-sm uppercase tracking-wide mr-2">For:</span>
                      {idea.targetUser}
                    </p>
                  </div>

                  {/* Tags - minimal */}
                  <div className="flex flex-wrap gap-2">
                    {idea.tags.slice(0, 3).map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary"
                        className="bg-gray-50 text-gray-600 text-xs font-light border-0"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Source - very subtle */}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="capitalize font-light">{idea.sourceType}</span>
                    <button 
                      onClick={() => window.open(idea.source, '_blank')}
                      className="hover:text-gray-600 underline font-light"
                    >
                      View source
                    </button>
                  </div>
                </div>

                {/* Bookmark - minimal */}
                <div className="col-span-1 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBookmark(idea.id)}
                    className={`h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                      bookmarkedIds.includes(idea.id) 
                        ? 'text-gray-900 opacity-100' 
                        : 'text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    <Plus className={`h-4 w-4 transform transition-transform ${
                      bookmarkedIds.includes(idea.id) ? 'rotate-45' : ''
                    }`} />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredIdeas.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-gray-500 text-lg font-light">No ideas match your search</p>
              <p className="text-gray-400 mt-2 font-light">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </section>

      {/* Email Signup */}
      <EmailSignup />

      {/* Footer - minimal */}
      <footer className="border-t border-gray-100 px-6 py-12 text-center">
        <p className="text-gray-400 font-light">© 2024 PromptMine</p>
      </footer>
    </div>
  );
};

export default Index;
