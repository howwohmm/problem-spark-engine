
import React, { createContext, useContext, useState, useEffect } from 'react';

interface BookmarkCollection {
  id: string;
  name: string;
  ideaIds: string[];
  color: string;
}

interface BookmarkContextType {
  collections: BookmarkCollection[];
  bookmarkedIds: string[];
  createCollection: (name: string, color: string) => void;
  deleteCollection: (id: string) => void;
  addToCollection: (collectionId: string, ideaId: string) => void;
  removeFromCollection: (collectionId: string, ideaId: string) => void;
  toggleBookmark: (ideaId: string) => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider = ({ children }: { children: React.ReactNode }) => {
  const [collections, setCollections] = useState<BookmarkCollection[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    const savedCollections = localStorage.getItem('promptmine-collections');
    const savedBookmarks = localStorage.getItem('promptmine-bookmarks');
    
    if (savedCollections) {
      setCollections(JSON.parse(savedCollections));
    }
    if (savedBookmarks) {
      setBookmarkedIds(JSON.parse(savedBookmarks));
    }
  }, []);

  const saveCollections = (newCollections: BookmarkCollection[]) => {
    setCollections(newCollections);
    localStorage.setItem('promptmine-collections', JSON.stringify(newCollections));
  };

  const saveBookmarks = (newBookmarks: string[]) => {
    setBookmarkedIds(newBookmarks);
    localStorage.setItem('promptmine-bookmarks', JSON.stringify(newBookmarks));
  };

  const createCollection = (name: string, color: string) => {
    const newCollection: BookmarkCollection = {
      id: Date.now().toString(),
      name,
      ideaIds: [],
      color
    };
    saveCollections([...collections, newCollection]);
  };

  const deleteCollection = (id: string) => {
    saveCollections(collections.filter(c => c.id !== id));
  };

  const addToCollection = (collectionId: string, ideaId: string) => {
    const updated = collections.map(c => 
      c.id === collectionId 
        ? { ...c, ideaIds: [...c.ideaIds, ideaId] }
        : c
    );
    saveCollections(updated);
  };

  const removeFromCollection = (collectionId: string, ideaId: string) => {
    const updated = collections.map(c => 
      c.id === collectionId 
        ? { ...c, ideaIds: c.ideaIds.filter(id => id !== ideaId) }
        : c
    );
    saveCollections(updated);
  };

  const toggleBookmark = (ideaId: string) => {
    const newBookmarks = bookmarkedIds.includes(ideaId) 
      ? bookmarkedIds.filter(id => id !== ideaId)
      : [...bookmarkedIds, ideaId];
    saveBookmarks(newBookmarks);
  };

  return (
    <BookmarkContext.Provider value={{
      collections,
      bookmarkedIds,
      createCollection,
      deleteCollection,
      addToCollection,
      removeFromCollection,
      toggleBookmark
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
