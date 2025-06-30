
import { useTheme } from '@/contexts/ThemeContext';

export const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex flex-col">
            <div className="text-2xl font-normal text-gray-900 dark:text-white">
              Ideas
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-light">
              curated by Ohm.
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
