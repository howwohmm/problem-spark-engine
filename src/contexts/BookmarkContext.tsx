
import React, { createContext, useContext, useState, useEffect } from 'react';
import { bookmarkService, type BookmarkCollection } from '@/services/bookmarkService';
import { useAuth } from '@/hooks/useAuth';

interface BookmarkContextType {
  collections: BookmarkCollection[];
  bookmarkedIds: string[];
  createCollection: (name: string, color: string, description?: string) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  addToCollection: (collectionId: string, ideaId: string) => Promise<void>;
  removeFromCollection: (collectionId: string, ideaId: string) => Promise<void>;
  toggleBookmark: (ideaId: string) => Promise<void>;
  loading: boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider = ({ children }: { children: React.ReactNode }) => {
  const [collections, setCollections] = useState<BookmarkCollection[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Load user's bookmarks and collections
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    } else {
      // Load from localStorage for non-authenticated users
      const savedBookmarks = localStorage.getItem('promptmine-bookmarks');
      const savedCollections = localStorage.getItem('promptmine-collections');
      
      if (savedBookmarks) {
        setBookmarkedIds(JSON.parse(savedBookmarks));
      }
      if (savedCollections) {
        setCollections(JSON.parse(savedCollections));
      }
    }
  }, [isAuthenticated, user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [userBookmarks, userCollections] = await Promise.all([
        bookmarkService.getBookmarks(user.id),
        bookmarkService.getCollections(user.id)
      ]);

      setBookmarkedIds(userBookmarks);
      setCollections(userCollections);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async (name: string, color: string, description?: string) => {
    if (isAuthenticated && user) {
      const newCollection = await bookmarkService.createCollection(user.id, name, description, color);
      if (newCollection) {
        setCollections(prev => [newCollection, ...prev]);
      }
    } else {
      // Local storage fallback
      const newCollection: BookmarkCollection = {
        id: Date.now().toString(),
        name,
        description,
        color,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'local'
      };
      const updated = [newCollection, ...collections];
      setCollections(updated);
      localStorage.setItem('promptmine-collections', JSON.stringify(updated));
    }
  };

  const deleteCollection = async (id: string) => {
    if (isAuthenticated && user) {
      const success = await bookmarkService.deleteCollection(id);
      if (success) {
        setCollections(prev => prev.filter(c => c.id !== id));
      }
    } else {
      // Local storage fallback
      const updated = collections.filter(c => c.id !== id);
      setCollections(updated);
      localStorage.setItem('promptmine-collections', JSON.stringify(updated));
    }
  };

  const addToCollection = async (collectionId: string, ideaId: string) => {
    if (isAuthenticated && user) {
      await bookmarkService.addToCollection(collectionId, ideaId);
    }
    // For local storage, we'd need to track collection items separately
  };

  const removeFromCollection = async (collectionId: string, ideaId: string) => {
    if (isAuthenticated && user) {
      await bookmarkService.removeFromCollection(collectionId, ideaId);
    }
    // For local storage, we'd need to track collection items separately
  };

  const toggleBookmark = async (ideaId: string) => {
    if (isAuthenticated && user) {
      try {
        const isBookmarked = await bookmarkService.toggleBookmark(user.id, ideaId);
        if (isBookmarked) {
          setBookmarkedIds(prev => [...prev, ideaId]);
        } else {
          setBookmarkedIds(prev => prev.filter(id => id !== ideaId));
        }
      } catch (error) {
        console.error('Error toggling bookmark:', error);
      }
    } else {
      // Local storage fallback
      const newBookmarks = bookmarkedIds.includes(ideaId) 
        ? bookmarkedIds.filter(id => id !== ideaId)
        : [...bookmarkedIds, ideaId];
      setBookmarkedIds(newBookmarks);
      localStorage.setItem('promptmine-bookmarks', JSON.stringify(newBookmarks));
    }
  };

  return (
    <BookmarkContext.Provider value={{
      collections,
      bookmarkedIds,
      createCollection,
      deleteCollection,
      addToCollection,
      removeFromCollection,
      toggleBookmark,
      loading
    }}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};
