import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'reusecampus_wishlist';

/**
 * Helper to retrieve stored wishlist IDs safely from localStorage
 */
const getStoredWishlist = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read wishlist from localStorage:', err);
    return [];
  }
};

/**
 * Custom React Hook for Managing Saved Campus Listings (Wishlist)
 * Persisted in browser localStorage and kept reactive across components.
 */
export const useWishlist = () => {
  const [savedIds, setSavedIds] = useState(getStoredWishlist);

  useEffect(() => {
    const handleSync = () => {
      setSavedIds(getStoredWishlist());
    };

    window.addEventListener('reusecampus-wishlist-sync', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('reusecampus-wishlist-sync', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const toggleWishlist = useCallback((id) => {
    if (!id) return;
    const stringId = String(id);

    setSavedIds((prev) => {
      const exists = prev.includes(stringId);
      const nextList = exists
        ? prev.filter((savedId) => savedId !== stringId)
        : [...prev, stringId];

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
      } catch (err) {
        console.error('Failed to write wishlist to localStorage:', err);
      }

      // Dispatch custom event to notify all other active hook instances
      window.dispatchEvent(new Event('reusecampus-wishlist-sync'));
      return nextList;
    });
  }, []);

  const isWishlisted = useCallback(
    (id) => {
      if (!id) return false;
      return savedIds.includes(String(id));
    },
    [savedIds]
  );

  return {
    savedIds,
    toggleWishlist,
    isWishlisted,
    count: savedIds.length,
  };
};

export default useWishlist;
