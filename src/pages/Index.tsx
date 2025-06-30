
import { useState, useMemo } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { IdeaCard } from '@/components/IdeaCard';
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
    return Array.from(tags).sort();
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
      
      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto">
        {/* Hero Section - Stripe-inspired minimal header */}
        <section className="px-6 py-16 border-b border-gray-200">
          <div className="max-w-4xl">
            <h1 className="text-6xl font-normal mb-6 text-gray-900 tracking-tight">
              Ideas
            </h1>
            <p className="text-xl text-gray-600 mb-4 font-normal leading-relaxed">
              Turn community noise into build-ready ideas
            </p>
            <p className="text-gray-500 max-w-2xl leading-relaxed">
              We scan Reddit, Hacker News, and other communities to surface real problems 
              people are discussing. Each problem becomes an execution-ready startup idea 
              with context, target users, and MVP suggestions.
            </p>
          </div>
        </section>

        {/* Filters Section - Clean Stripe-style */}
        <section className="px-6 py-8">
          <div className="flex flex-col gap-6">
            {/* Search and Filters Row */}
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                Filters
              </div>
              <div className="flex-1 relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search problems, solutions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>
            </div>

            {/* Tag Filters - Stripe-style pills */}
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={`cursor-pointer transition-all border text-sm font-normal ${
                    selectedTags.includes(tag)
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900 hover:text-gray-900'
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-500">
              {filteredIdeas.length} ideas
            </div>
          </div>
        </section>

        {/* Ideas List - Table-like layout inspired by Stripe */}
        <section className="px-6 pb-16">
          <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-700 uppercase tracking-wide">
                <div className="col-span-1">Date</div>
                <div className="col-span-7">Problem & Solution</div>
                <div className="col-span-3">Target User</div>
                <div className="col-span-1"></div>
              </div>
            </div>

            {/* Ideas Rows */}
            {filteredIdeas.map((idea, index) => (
              <div 
                key={idea.id} 
                className={`px-6 py-6 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                  index === filteredIdeas.length - 1 ? 'border-b-0' : ''
                }`}
              >
                <div className="grid grid-cols-12 gap-4 items-start">
                  {/* Date */}
                  <div className="col-span-1">
                    <div className="text-sm text-gray-500 font-mono">
                      {idea.timestamp}
                    </div>
                  </div>

                  {/* Problem & Solution */}
                  <div className="col-span-7 space-y-3">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 leading-snug mb-2">
                        {idea.problem}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {idea.mvpSuggestion}
                      </p>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {idea.tags.map(tag => (
                        <Badge 
                          key={tag} 
                          variant="secondary"
                          className="bg-gray-100 text-gray-700 text-xs font-normal hover:bg-gray-200"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Source */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="capitalize">{idea.sourceType}</span>
                      <span>•</span>
                      <button 
                        onClick={() => window.open(idea.source, '_blank')}
                        className="hover:text-gray-900 underline"
                      >
                        View original
                      </button>
                    </div>
                  </div>

                  {/* Target User */}
                  <div className="col-span-3">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {idea.targetUser}
                    </p>
                  </div>

                  {/* Bookmark */}
                  <div className="col-span-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleBookmark(idea.id)}
                      className={`h-8 w-8 p-0 ${
                        bookmarkedIds.includes(idea.id) 
                          ? 'text-gray-900' 
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
              <div className="px-6 py-16 text-center">
                <p className="text-gray-500 text-lg">No ideas match your search criteria</p>
                <p className="text-gray-400 mt-2">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Email Signup */}
      <EmailSignup />

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-8 text-center text-gray-500">
        <p>© 2024 PromptMine. Built for builders who ship.</p>
      </footer>
    </div>
  );
};

export default Index;
