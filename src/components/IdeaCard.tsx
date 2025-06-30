
import { ExternalLink, Bookmark, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

interface IdeaCardProps {
  idea: Idea;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

export const IdeaCard = ({ idea, isBookmarked, onToggleBookmark }: IdeaCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSourceColor = (sourceType: string) => {
    switch (sourceType) {
      case 'reddit': return 'text-orange-500';
      case 'hackernews': return 'text-amber-500';
      case 'twitter': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getSourceDisplay = (sourceType: string) => {
    switch (sourceType) {
      case 'reddit': return 'Reddit';
      case 'hackernews': return 'Hacker News';
      case 'twitter': return 'Twitter';
      default: return 'Unknown';
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className="bg-gray-900 border-gray-700 hover:border-gray-600 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/10">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className={getSourceColor(idea.sourceType)}>
              {getSourceDisplay(idea.sourceType)}
            </span>
            <span>•</span>
            <span>{idea.timestamp}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleBookmark}
              className={`p-1 h-auto ${
                isBookmarked 
                  ? 'text-orange-400 hover:text-orange-500' 
                  : 'text-gray-400 hover:text-orange-400'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpanded}
              className="p-1 h-auto text-gray-400 hover:text-orange-400 transition-colors"
            >
              {isExpanded ? (
                <X className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Problem - Always visible (this is the title) */}
        <div>
          <p className="text-gray-100 font-medium text-base sm:text-lg leading-relaxed">
            {idea.problem}
          </p>
        </div>

        {/* Expandable content - Only show when expanded */}
        {isExpanded && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* MVP Suggestion (Description) */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-green-400 uppercase tracking-wide">Description</span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                {idea.mvpSuggestion}
              </p>
            </div>

            {/* Target User */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-blue-400 uppercase tracking-wide">Target User</span>
              </div>
              <p className="text-gray-300">
                {idea.targetUser}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {idea.tags.map(tag => (
                <Badge 
                  key={tag} 
                  variant="secondary"
                  className="bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Source Link */}
            <div className="pt-2 border-t border-gray-700">
              <button
                onClick={() => window.open(idea.source, '_blank')}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-400 transition-colors group"
              >
                <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" />
                View Original Post
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
