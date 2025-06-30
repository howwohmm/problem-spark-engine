
import { ExternalLink, Bookmark, Users, Target, Lightbulb, Plus, X, Share2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(idea.source);
    setIsDropdownOpen(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: idea.problem,
        text: idea.mvpSuggestion,
        url: idea.source,
      });
    } else {
      handleCopyLink();
    }
    setIsDropdownOpen(false);
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
            
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto text-gray-400 hover:text-orange-400"
                >
                  {isDropdownOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48 bg-gray-800 border-gray-700"
              >
                <DropdownMenuItem 
                  onClick={handleShare}
                  className="text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Idea
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleCopyLink}
                  className="text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Source Link
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem 
                  onClick={() => window.open(idea.source, '_blank')}
                  className="text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Original Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Problem */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-red-400" />
            <span className="text-xs font-medium text-red-400 uppercase tracking-wide">Problem</span>
          </div>
          <p className="text-gray-100 font-medium leading-relaxed">
            {idea.problem}
          </p>
        </div>

        {/* Target User */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-medium text-blue-400 uppercase tracking-wide">Target User</span>
          </div>
          <p className="text-gray-300">
            {idea.targetUser}
          </p>
        </div>

        {/* MVP Suggestion */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-green-400" />
            <span className="text-xs font-medium text-green-400 uppercase tracking-wide">MVP Idea</span>
          </div>
          <p className="text-gray-300 leading-relaxed">
            {idea.mvpSuggestion}
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
      </CardContent>
    </Card>
  );
};
