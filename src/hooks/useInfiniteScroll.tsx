
import { useState, useEffect, useMemo } from 'react';

interface UseInfiniteScrollProps<T> {
  items: T[];
  itemsPerPage: number;
}

export const useInfiniteScroll = <T,>({ items, itemsPerPage }: UseInfiniteScrollProps<T>) => {
  const [displayedItemsCount, setDisplayedItemsCount] = useState(itemsPerPage);

  const displayedItems = useMemo(() => {
    return items.slice(0, displayedItemsCount);
  }, [items, displayedItemsCount]);

  const hasMore = displayedItemsCount < items.length;

  const loadMore = () => {
    if (hasMore) {
      setDisplayedItemsCount(prev => Math.min(prev + itemsPerPage, items.length));
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || !hasMore) {
        return;
      }
      loadMore();
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore]);

  // Reset when items change (e.g., after filtering)
  useEffect(() => {
    setDisplayedItemsCount(itemsPerPage);
  }, [items.length, itemsPerPage]);

  return {
    displayedItems,
    hasMore,
    loadMore
  };
};
