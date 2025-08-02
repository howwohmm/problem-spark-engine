
import { supabase } from '@/integrations/supabase/client';

export interface BookmarkCollection {
  id: string;
  name: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  idea_id: string;
  created_at: string;
}

class BookmarkService {
  async getBookmarks(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('idea_id')
        .eq('user_id', userId);

      if (error) throw error;

      return (data || []).map(bookmark => bookmark.idea_id);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      return [];
    }
  }

  async toggleBookmark(userId: string, ideaId: string): Promise<boolean> {
    try {
      // Check if bookmark exists
      const { data: existing } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('idea_id', ideaId)
        .single();

      if (existing) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('idea_id', ideaId);

        if (error) throw error;
        return false; // Bookmark removed
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert([{ user_id: userId, idea_id: ideaId }]);

        if (error) throw error;
        return true; // Bookmark added
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  }

  async getCollections(userId: string): Promise<BookmarkCollection[]> {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching collections:', error);
      return [];
    }
  }

  async createCollection(userId: string, name: string, description?: string, color: string = '#3b82f6'): Promise<BookmarkCollection | null> {
    try {
      const { data, error } = await supabase
        .from('collections')
        .insert([{
          user_id: userId,
          name,
          description,
          color
        }])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating collection:', error);
      return null;
    }
  }

  async deleteCollection(collectionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', collectionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting collection:', error);
      return false;
    }
  }

  async addToCollection(collectionId: string, ideaId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('collection_items')
        .insert([{ collection_id: collectionId, idea_id: ideaId }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding to collection:', error);
      return false;
    }
  }

  async removeFromCollection(collectionId: string, ideaId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('collection_items')
        .delete()
        .eq('collection_id', collectionId)
        .eq('idea_id', ideaId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing from collection:', error);
      return false;
    }
  }

  async getCollectionItems(collectionId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('collection_items')
        .select('idea_id')
        .eq('collection_id', collectionId);

      if (error) throw error;

      return (data || []).map(item => item.idea_id);
    } catch (error) {
      console.error('Error fetching collection items:', error);
      return [];
    }
  }
}

export const bookmarkService = new BookmarkService();
