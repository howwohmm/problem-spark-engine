
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Play } from 'lucide-react';

export const TriggerScraping = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleTriggerScraping = async () => {
    try {
      setIsLoading(true);
      
      // For now, just show a message that this needs to be set up
      toast.info(
        'Scraping is currently set up as a scheduled job. Run "npm run test:scraper" in the terminal to manually fetch new ideas.',
        { duration: 7000 }
      );

      // Alternatively, you could make a direct API call to your scraper endpoint
      // if you set it up as a separate API route

    } catch (error) {
      console.error('❌ Scraping error:', error);
      toast.error(`Scraping failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button 
        onClick={handleTriggerScraping}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        {isLoading ? 'Fetching Ideas...' : 'Fetch Latest Ideas'}
      </Button>
    </div>
  );
};
