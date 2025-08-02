
import { supabase } from '@/integrations/supabase/client';

interface ApiIdea {
  id: string;
  problem: string;
  target_user: string;
  mvp_suggestion: string;
  source_url: string;
  source_platform: 'reddit' | 'hackernews' | 'twitter';
  tags: string[];
  created_at: string;
  confidence_score?: number;
}

interface ApiResponse {
  ideas: ApiIdea[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface FetchIdeasParams {
  page?: number;
  limit?: number;
  tags?: string[];
  source?: string;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'popular';
}

class ApiService {
  async fetchIdeas(params: FetchIdeasParams = {}): Promise<ApiResponse> {
    const {
      page = 1,
      limit = 10,
      tags = [],
      source,
      search,
      sortBy = 'newest'
    } = params;

    try {
      let query = supabase
        .from('ideas')
        .select('*', { count: 'exact' })
        .gte('confidence_score', 0.7);

      // Apply filters
      if (tags.length > 0) {
        query = query.overlaps('tags', tags);
      }

      if (source) {
        query = query.eq('source_platform', source);
      }

      if (search) {
        query = query.or(`problem.ilike.%${search}%,mvp_suggestion.ilike.%${search}%,target_user.ilike.%${search}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'popular':
          query = query.order('confidence_score', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      const ideas: ApiIdea[] = (data || []).map(row => ({
        id: row.id,
        problem: row.problem,
        target_user: row.target_user || '',
        mvp_suggestion: row.mvp_suggestion || '',
        source_url: row.source_url || '',
        source_platform: row.source_platform as 'reddit' | 'hackernews' | 'twitter',
        tags: row.tags || [],
        created_at: row.created_at,
        confidence_score: row.confidence_score
      }));

      return {
        ideas,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('API Error:', error);
      throw new Error(`Failed to fetch ideas: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAllTags(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('tags')
        .gte('confidence_score', 0.7)
        .not('tags', 'is', null);

      if (error) {
        throw error;
      }

      // Extract and flatten all unique tags
      const allTags = new Set<string>();
      
      (data || []).forEach(row => {
        if (row.tags && Array.isArray(row.tags)) {
          row.tags.forEach((tag: string) => {
            if (tag && typeof tag === 'string') {
              allTags.add(tag.trim());
            }
          });
        }
      });

      return Array.from(allTags).sort();
    } catch (error) {
      console.error('Tags API Error:', error);
      // Return fallback tags if API fails
      return [
        'AI', 'DevTools', 'Automation', 'Social Media', 'Small Business',
        'Productivity', 'E-commerce', 'SaaS', 'Mobile App', 'Web App'
      ];
    }
  }

  async triggerScraping(): Promise<{ success: boolean; message: string }> {
    try {
      // This would call a Supabase Edge Function for scraping
      const { data, error } = await supabase.functions.invoke('scrape-ideas');
      
      if (error) {
        throw error;
      }

      return data || { success: true, message: 'Scraping triggered successfully' };
    } catch (error) {
      console.error('Scraping trigger error:', error);
      throw new Error('Failed to trigger scraping');
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types
export type { ApiIdea, ApiResponse, FetchIdeasParams };
