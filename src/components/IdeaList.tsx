
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

export const IdeaList = ({ ideas, bookmarkedIds, onToggleBookmark }: IdeaListProps) => {
  const { displayedItems, hasMore, loadMore } = useInfiniteScroll({ 
    items: ideas, 
    itemsPerPage: 10 
  });

  if (ideas.length === 0) {
    return (
      <section className="px-6 pb-24 max-w-7xl mx-auto bg-white dark:bg-gray-900 transition-colors">
        <div className="py-24 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg font-light">No ideas match your search</p>
          <p className="text-gray-400 dark:text-gray-500 mt-2 font-light">Try adjusting your filters</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 pb-24 max-w-7xl mx-auto bg-white dark:bg-gray-900 transition-colors">
      <div className="space-y-0">
        {displayedItems.map((idea) => (
          <div 
            key={idea.id} 
            className="py-8 border-b border-gray-100 dark:border-gray-800 last:border-b-0 group"
          >
            <div className="flex gap-8 items-start">
              {/* Date - Fixed width */}
              <div className="w-20 flex-shrink-0">
                <div className="text-sm text-gray-400 dark:text-gray-500 font-light">
                  {idea.timestamp}
                </div>
              </div>

              {/* Main Content - Takes remaining space */}
              <div className="flex-1 min-w-0 space-y-4">
                {/* Problem */}
                <div>
                  <h3 className="text-xl font-light text-gray-900 dark:text-white leading-relaxed mb-3">
                    {idea.problem}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-light">
                    {idea.mvpSuggestion}
                  </p>
                </div>
                
                {/* Target User */}
                <div>
                  <p className="text-gray-500 dark:text-gray-400 font-light leading-relaxed">
                    <span className="text-gray-400 dark:text-gray-500 text-sm uppercase tracking-wide mr-2">For:</span>
                    {idea.targetUser}
                  </p>
                </div>

                {/* Tags and Source - Horizontal layout */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {idea.tags.slice(0, 3).map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary"
                        className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-light border-0"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Source */}
                  <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                    <span className="capitalize font-light">{idea.sourceType}</span>
                    <button 
                      onClick={() => window.open(idea.source, '_blank')}
                      className="hover:text-gray-600 dark:hover:text-gray-300 underline font-light"
                    >
                      View source
                    </button>
                  </div>
                </div>
              </div>

              {/* Bookmark - Fixed width */}
              <div className="w-8 flex-shrink-0 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleBookmark(idea.id)}
                  className={`h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                    bookmarkedIds.includes(idea.id) 
                      ? 'text-gray-900 dark:text-white opacity-100' 
                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white'
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

      {/* Load more button for infinite scroll */}
      {hasMore && (
        <div className="flex justify-center mt-12">
          <Button
            onClick={loadMore}
            variant="outline"
            className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500"
          >
            Load More Ideas
          </Button>
        </div>
      )}
    </section>
  );
};
