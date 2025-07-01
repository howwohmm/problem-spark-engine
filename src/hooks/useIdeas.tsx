
import { useQuery } from '@tanstack/react-query';
import { mockIdeas } from '@/data/mockIdeas';

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

export const useIdeas = () => {
  return useQuery({
    queryKey: ['ideas'],
    queryFn: async () => {
      console.log('Using mock data for ideas');
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockIdeas;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
