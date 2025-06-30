
import { useState, useMemo } from 'react';
import { Search, Bookmark, ExternalLink, Filter, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
      
      // Save to localStorage
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
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Header />
      
      {/* Hero Section */}
      <section className="px-6 py-16 text-center border-b border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
            PromptMine
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            Turn community noise into build-ready ideas
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            We scan Reddit, Hacker News, and other communities to surface real problems 
            people are discussing. Each problem becomes an execution-ready startup idea 
            with context, target users, and MVP suggestions.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>🔍 Auto-scraped from communities</span>
            <span>•</span>
            <span>🎯 AI-processed for clarity</span>
            <span>•</span>
            <span>🛠️ Ready to build</span>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="px-6 py-8 border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search problems, solutions, or users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-400"
              />
            </div>
            <Button 
              variant="outline" 
              className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Tag filters */}
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800'
                }`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>

          <div className="mt-4 text-sm text-gray-400">
            Showing {filteredIdeas.length} of {mockIdeas.length} ideas
          </div>
        </div>
      </section>

      {/* Ideas Feed */}
      <section className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIdeas.map(idea => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                isBookmarked={bookmarkedIds.includes(idea.id)}
                onToggleBookmark={() => toggleBookmark(idea.id)}
              />
            ))}
          </div>

          {filteredIdeas.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">No ideas match your search criteria</p>
              <p className="text-gray-500 mt-2">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </section>

      {/* Email Signup */}
      <EmailSignup />

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-800 text-center text-gray-500">
        <p>© 2024 PromptMine. Built for builders who ship.</p>
      </footer>
    </div>
  );
};

export default Index;
