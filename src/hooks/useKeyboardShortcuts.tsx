
import { useEffect } from 'react';

interface KeyboardShortcuts {
  onSearch: () => void;
  onToggleTheme: () => void;
  onClearFilters: () => void;
}

export const useKeyboardShortcuts = ({ onSearch, onToggleTheme, onClearFilters }: KeyboardShortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Cmd/Ctrl + K for search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        onSearch();
      }

      // Cmd/Ctrl + D for theme toggle
      if ((event.metaKey || event.ctrlKey) && event.key === 'd') {
        event.preventDefault();
        onToggleTheme();
      }

      // Escape to clear filters
      if (event.key === 'Escape') {
        onClearFilters();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSearch, onToggleTheme, onClearFilters]);
};
