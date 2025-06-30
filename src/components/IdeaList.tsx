
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  if (ideas.length === 0) {
    return (
      <section className="px-6 pb-24 max-w-7xl mx-auto">
        <div className="py-24 text-center">
          <p className="text-gray-500 text-lg font-light">No ideas match your search</p>
          <p className="text-gray-400 mt-2 font-light">Try adjusting your filters</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 pb-24 max-w-7xl mx-auto">
      <div className="space-y-0">
        {ideas.map((idea) => (
          <div 
            key={idea.id} 
            className="py-12 border-b border-gray-100 last:border-b-0 group"
          >
            <div className="grid grid-cols-12 gap-8 items-start">
              {/* Date */}
              <div className="col-span-2">
                <div className="text-sm text-gray-400 font-light">
                  {idea.timestamp}
                </div>
              </div>

              {/* Main Content */}
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

                {/* Tags */}
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

                {/* Source */}
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

              {/* Bookmark */}
              <div className="col-span-1 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleBookmark(idea.id)}
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
      </div>
    </section>
  );
};
