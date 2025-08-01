// Frontend service to fetch real data from API
interface ApiIdea {
  id: string;
  problem: string;
  targetUser: string;
  mvpSuggestion: string;
  source: string;
  sourceType: 'reddit' | 'hackernews' | 'twitter';
  tags: string[];
  timestamp: string;
  confidence?: number;
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
  private baseUrl: string;

  constructor() {
    // Use environment variable for API base URL, fallback to current domain
    this.baseUrl = import.meta.env.VITE_API_URL || '';
  }

  async fetchIdeas(params: FetchIdeasParams = {}): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.tags && params.tags.length > 0) {
      searchParams.set('tags', params.tags.join(','));
    }
    if (params.source) searchParams.set('source', params.source);
    if (params.search) searchParams.set('search', params.search);
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);

    const url = `${this.baseUrl}/api/ideas?${searchParams.toString()}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw new Error(`Failed to fetch ideas: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAllTags(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tags: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.tags || [];
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
      const response = await fetch(`${this.baseUrl}/api/scrape-ideas`, {
        method: 'POST'
      });
      
      const data = await response.json();
      return data;
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