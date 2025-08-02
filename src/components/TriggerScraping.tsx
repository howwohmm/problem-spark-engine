
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Play } from 'lucide-react';

export const TriggerScraping = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleTriggerScraping = async () => {
    try {
      setIsLoading(true);
      console.log('🚀 Triggering scraping function...');
      
      const { data, error } = await supabase.functions.invoke('scrape-ideas', {
        body: { scheduled: false }
      });

      if (error) {
        throw error;
      }

      console.log('✅ Scraping response:', data);
      
      toast.success(
        `Scraping complete! Found ${data.scraped || 0} posts, processed ${data.processed || 0} new ideas`,
        { duration: 5000 }
      );

      // Refresh the page after successful scraping
      setTimeout(() => {
        window.location.reload();
      }, 2000);

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
