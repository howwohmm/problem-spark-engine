
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Idea {
  id: string;
  problem: string;
  target_user: string;
  mvp_suggestion: string;
  tags: string[];
  source_url: string;
  source_platform: 'reddit' | 'hackernews' | 'twitter';
  created_at: string;
}

export const useIdeas = () => {
  return useQuery({
    queryKey: ['ideas'],
    queryFn: async () => {
      console.log('Fetching ideas from Supabase...');
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ideas:', error);
        throw error;
      }

      console.log('Fetched', data?.length || 0, 'ideas from database');

      // Transform the data to match the expected format
      return (data || []).map(idea => ({
        id: idea.id,
        problem: idea.problem || '',
        targetUser: idea.target_user || '',
        mvpSuggestion: idea.mvp_suggestion || '',
        source: idea.source_url || '',
        sourceType: idea.source_platform as 'reddit' | 'hackernews' | 'twitter',
        tags: idea.tags || [],
        timestamp: new Date(idea.created_at).toLocaleDateString()
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
