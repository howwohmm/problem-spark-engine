
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

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
  const {
    displayedItems,
    hasMore,
    loadMore
  } = useInfiniteScroll({
    items: ideas,
    itemsPerPage: 10
  });

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
        {displayedItems.map((idea) => (
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
                {/* Problem */}
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-foreground leading-relaxed mb-2">
                    {idea.problem}
                  </h3>
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
                      className="hover:text-foreground underline transition-colors"
                    >
                      View source
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {idea.tags.slice(0, 3).map((tag) => (
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
                      className="hover:text-foreground underline transition-colors"
                    >
                      View source
                    </button>
                  </div>
                </div>
              </div>

              {/* Bookmark */}
              <div className="w-8 flex-shrink-0 flex justify-end">
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
        ))}
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
