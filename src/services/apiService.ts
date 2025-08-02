
import { supabase } from '@/integrations/supabase/client';

interface ApiIdea {
  id: string;
  problem: string;
  target_user: string;
  mvp_suggestion: string;
  original_description?: string;
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
  private API_BASE = 'http://localhost:3000/api';

  async fetchIdeas(params: FetchIdeasParams = {}): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/ideas`);
      if (!response.ok) {
        throw new Error('Failed to fetch ideas');
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw new Error(`Failed to fetch ideas: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAllTags(): Promise<string[]> {
    try {
      const { ideas } = await this.fetchIdeas();
      
      // Extract and flatten all unique tags
      const allTags = new Set<string>();
      
      ideas.forEach(idea => {
        if (idea.tags && Array.isArray(idea.tags)) {
          idea.tags.forEach(tag => {
            if (tag && typeof tag === 'string') {
              allTags.add(tag.trim());
            }
          });
        }
      });

      return Array.from(allTags).sort();
    } catch (error) {
      console.error('Tags API Error:', error);
      // Return predefined tags if API fails
      return [
        'AI/ML', 'Blockchain', 'IoT', 'VR/AR', 'Cloud', 'Mobile', 'Web3', 'API',
        'SaaS', 'Marketplace', 'Platform', 'B2B', 'B2C', 'Enterprise', 'Subscription', 'Freemium',
        'FinTech', 'HealthTech', 'EdTech', 'E-commerce', 'Gaming', 'Social Media', 'Productivity',
        'Security', 'DevTools', 'Legal Tech', 'Real Estate', 'Travel',
        'Automation', 'Analytics', 'Collaboration', 'Communication', 'Data Management', 'Open Source'
      ];
    }
  }

  async triggerScraping(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.API_BASE}/scrape-ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to trigger scraping');
      }

      return await response.json();
    } catch (error) {
      console.error('Scraping trigger error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types
export type { ApiIdea, ApiResponse, FetchIdeasParams };
