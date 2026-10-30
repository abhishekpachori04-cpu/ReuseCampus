import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ArrowLeft,
  Loader2,
  PackageOpen,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { getSavedItemsApi, getListings } from '../services/api';
import useAuth from '../context/useAuth';
import useWishlist from '../context/useWishlist';
import ListingCard from '../components/listings/ListingCard';
import ListingSkeleton from '../components/ui/ListingSkeleton';

/**
 * SavedItems (Wishlist) Page
 * Displays user's bookmarked items, cleans up dead / ghost listing references,
 * and synchronizes valid items with AuthContext and WishlistContext.
 */
const SavedItems = () => {
  const navigate = useNavigate();
  const { user, updateSavedItems, isAuthenticated } = useAuth();
  const { savedIds, setSavedItems } = useWishlist();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      let validListings = [];

      if (isAuthenticated) {
        // Authenticated: Fetch from GET /api/users/saved with server-side auto-cleanup
        try {
          const res = await getSavedItemsApi();
          if (res.data?.success && Array.isArray(res.data?.data)) {
            validListings = res.data.data.filter(
              (item) => item !== null && item !== undefined && item._id
            );
          }
        } catch {
          // Fallback to getListings by IDs if user endpoint has temporary failure
          if (savedIds.length > 0) {
            const res = await getListings({ ids: savedIds.join(',') });
            if (res.data?.success && Array.isArray(res.data?.data)) {
              validListings = res.data.data.filter(
                (item) => item !== null && item !== undefined && item._id
              );
            }
          }
        }
      } else {
        // Unauthenticated visitor: Fetch by saved IDs from localStorage
        if (savedIds.length > 0) {
          const res = await getListings({ ids: savedIds.join(',') });
          if (res.data?.success && Array.isArray(res.data?.data)) {
            validListings = res.data.data.filter(
              (item) => item !== null && item !== undefined && item._id
            );
          }
        }
      }

      // Filter out any null or malformed items defensively
      const cleanItems = validListings.filter((item) => item !== null && item !== undefined);
      setItems(cleanItems);

      // Extract valid IDs
      const cleanIds = cleanItems.map((item) => String(item._id));

      // Synchronize global AuthContext / User state so badge immediately matches
      if (typeof updateSavedItems === 'function') {
        updateSavedItems(cleanIds);
      }

      // Synchronize global WishlistContext & localStorage
      if (typeof setSavedItems === 'function') {
        setSavedItems(cleanIds);
      }
    } catch (err) {
      console.error('[Fetch Saved Items Error]:', err);
      setError('Failed to load saved items. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, savedIds, setSavedItems, updateSavedItems]);

  useEffect(() => {
    let ignore = false;
    const runFetch = async () => {
      await Promise.resolve();
      if (!ignore) {
        fetchWishlist();
      }
    };
    runFetch();
    return () => {
      ignore = true;
    };
  }, [fetchWishlist]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header and Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer group mb-2"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Campus Marketplace</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-sm">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Saved Items (Wishlist)
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {items.length} {items.length === 1 ? 'item' : 'items'} saved for later review
              </p>
            </div>
          </div>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Synced & Verified
            </span>
          </div>
        )}
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ListingSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <p className="text-rose-600 text-sm font-semibold">{error}</p>
          <button
            type="button"
            onClick={fetchWishlist}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Try Again
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto shadow-sm">
            <Heart className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-800">Your Saved Wishlist is Empty</h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              You haven't bookmarked any campus items yet. Tap the heart icon on any listing to save it here!
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              Browse Campus Marketplace →
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Defensive fallback filtering: savedItems.filter(item => item !== null).map(...) */}
          {items
            .filter((item) => item !== null && item !== undefined && item._id)
            .map((item) => (
              <ListingCard key={item._id} item={item} />
            ))}
        </div>
      )}
    </div>
  );
};

export default SavedItems;
