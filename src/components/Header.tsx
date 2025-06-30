
import { useState } from 'react';
import { Bookmark, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Header = () => {
  const [showBookmarks, setShowBookmarks] = useState(false);

  return (
    <header className="px-6 py-4 border-b border-gray-800">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-amber-500 rounded-lg flex items-center justify-center">
            <span className="text-gray-900 font-bold text-sm">PM</span>
          </div>
          <span className="font-semibold text-gray-100">PromptMine</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">
            Browse Ideas
          </a>
          <a href="#digest" className="text-gray-300 hover:text-orange-400 transition-colors">
            Weekly Digest
          </a>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowBookmarks(!showBookmarks)}
            className="text-gray-300 hover:text-orange-400"
          >
            <Bookmark className="h-4 w-4 mr-2" />
            Bookmarks
          </Button>
        </nav>

        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
