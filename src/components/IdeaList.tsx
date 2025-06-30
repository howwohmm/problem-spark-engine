
import { Plus, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useState } from 'react';

interface Idea {
  id: string;
  problem: string;
  targetUser: string;
  mvpSuggestion: string;
  source: string;
  sourceType: 'reddit' | 'hackernews' | 'twitter';
  tags: string[];
  timestamp: string;
}

interface IdeaListProps {
  ideas: Idea[];
  bookmarkedIds: string[];
  onToggleBookmark: (ideaId: string) => void;
}

export const IdeaList = ({
  ideas,
  bookmarkedIds,
  onToggleBookmark
}: IdeaListProps) => {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  
  const {
    displayedItems,
    hasMore,
    loadMore
  } = useInfiniteScroll({
    items: ideas,
    itemsPerPage: 10
  });

  const toggleExpanded = (ideaId: string) => {
    setExpandedIds(prev => 
      prev.includes(ideaId) 
        ? prev.filter(id => id !== ideaId)
        : [...prev, ideaId]
    );
  };

  if (ideas.length === 0) {
    return (
      <section className="w-full py-16 sm:py-24 bg-background">
        <div className="text-left">
          <p className="text-muted-foreground text-base sm:text-lg">No ideas match your search</p>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">Try adjusting your filters</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full pb-16 sm:pb-24 bg-background">
      <div className="space-y-0">
        {displayedItems.map((idea) => {
          const isExpanded = expandedIds.includes(idea.id);
          
          return (
            <div
              key={idea.id}
              className="py-6 sm:py-8 border-b border-border last:border-b-0 group"
            >
              <div className="flex gap-3 sm:gap-6 items-start">
                {/* Date - Hidden on mobile */}
                <div className="hidden sm:block w-16 flex-shrink-0">
                  <div className="text-xs text-muted-foreground">
                    {idea.timestamp}
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Problem (Title) - Always visible */}
                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-foreground leading-relaxed">
                      {idea.problem}
                    </h3>
                  </div>

                  {/* Mobile Date and Source Row - Only when collapsed */}
                  {!isExpanded && (
                    <div className="flex sm:hidden items-center justify-between text-xs text-muted-foreground">
                      <span>{idea.timestamp}</span>
                      <span className="capitalize">{idea.sourceType}</span>
                    </div>
                  )}

                  {/* Expandable content - Only show when expanded */}
                  {isExpanded && (
                    <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                      {/* Description (MVP Suggestion) */}
                      <div>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                          {idea.mvpSuggestion}
                        </p>
                      </div>
                      
                      {/* Target User */}
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          <span className="text-muted-foreground/70 uppercase tracking-wide mr-2">For:</span>
                          {idea.targetUser}
                        </p>
                      </div>

                      {/* Mobile Date and Source Row */}
                      <div className="flex sm:hidden items-center justify-between text-xs text-muted-foreground">
                        <span>{idea.timestamp}</span>
                        <div className="flex items-center gap-2">
                          <span className="capitalize">{idea.sourceType}</span>
                          <button
                            onClick={() => window.open(idea.source, '_blank')}
                            className="hover:text-foreground underline transition-colors flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View source
                          </button>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {idea.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-secondary text-secondary-foreground text-xs border-0"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Desktop Source - Hidden on mobile */}
                      <div className="hidden sm:flex items-center justify-between">
                        <div></div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="capitalize">{idea.sourceType}</span>
                          <button
                            onClick={() => window.open(idea.source, '_blank')}
                            className="hover:text-foreground underline transition-colors flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View source
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expand/Collapse and Bookmark buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Expand/Collapse button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(idea.id)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isExpanded ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>

                  {/* Bookmark button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleBookmark(idea.id)}
                    className={`h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                      bookmarkedIds.includes(idea.id)
                        ? 'text-foreground opacity-100'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Plus className={`h-4 w-4 transform transition-transform ${
                      bookmarkedIds.includes(idea.id) ? 'rotate-45' : ''
                    }`} />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="flex justify-left mt-8 sm:mt-12">
          <Button
            onClick={loadMore}
            variant="outline"
            className="w-full sm:w-auto bg-background border-border hover:bg-accent text-foreground"
          >
            Load More Ideas
          </Button>
        </div>
      )}
    </section>
  );
};
