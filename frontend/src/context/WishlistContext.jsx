import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WishlistContext } from './wishlistContextInstance';

const STORAGE_KEY = 'reusecampus_wishlist';

/**
 * Safely retrieve initial wishlist IDs from localStorage
 */
const getInitialWishlist = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to parse wishlist from localStorage:', err);
    return [];
  }
};

/**
 * Global Wishlist Provider managing saved item IDs across the application
 */
export const WishlistProvider = ({ children }) => {
  const [savedItems, setSavedItems] = useState(getInitialWishlist);

  // Sync state if localStorage changes in another tab
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        setSavedItems(getInitialWishlist());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /**
   * Toggle saving/removing a listing ID
   */
  const toggleSaveItem = useCallback((id) => {
    if (!id) return;
    const stringId = String(id);

    setSavedItems((prev) => {
      const exists = prev.includes(stringId);
      const updated = exists
        ? prev.filter((savedId) => savedId !== stringId)
        : [...prev, stringId];

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to write wishlist to localStorage:', err);
      }

      return updated;
    });
  }, []);

  /**
   * Check if a listing ID is currently saved
   */
  const isSaved = useCallback(
    (id) => {
      if (!id) return false;
      return savedItems.includes(String(id));
    },
    [savedItems]
  );

  /**
   * Set or sync the entire wishlist IDs array (e.g. after removing dead/ghost references)
   */
  const syncSavedItems = useCallback((itemsOrIds) => {
    const ids = Array.isArray(itemsOrIds)
      ? itemsOrIds
          .map((item) => (typeof item === 'object' && item !== null ? item._id : item))
          .filter(Boolean)
          .map(String)
      : [];

    setSavedItems(ids);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (err) {
      console.error('Failed to write wishlist to localStorage:', err);
    }
  }, []);

  const value = useMemo(
    () => ({
      savedItems,
      setSavedItems: syncSavedItems,
      syncSavedItems,
      cleanDeadIds: syncSavedItems,
      toggleSaveItem,
      isSaved,
      // Aliases for seamless backward compatibility
      savedIds: savedItems,
      toggleWishlist: toggleSaveItem,
      isWishlisted: isSaved,
      count: savedItems.length,
    }),
    [savedItems, syncSavedItems, toggleSaveItem, isSaved]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistProvider;
