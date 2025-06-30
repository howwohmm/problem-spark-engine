
import { useState } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Header = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-normal text-gray-900">
              PromptMine
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
              Browse Ideas
            </a>
            <a href="#digest" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
              Weekly Digest
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
              Docs
            </a>
            <Button 
              variant="outline" 
              size="sm"
              className="border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900"
            >
              Console
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden text-gray-600 hover:text-gray-900"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <nav className="md:hidden mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col gap-4">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                Browse Ideas
              </a>
              <a href="#digest" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                Weekly Digest
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                Docs
              </a>
              <Button 
                variant="outline" 
                size="sm"
                className="border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900 w-fit"
              >
                Console
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
