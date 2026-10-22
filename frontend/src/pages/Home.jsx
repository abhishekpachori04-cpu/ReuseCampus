import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Coins,
  RefreshCw,
  Loader2,
  PackageOpen,
  Search,
  RotateCcw,
} from 'lucide-react';
import API from '../services/api';
import useAuth from '../context/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import useWishlist from '../hooks/useWishlist';
import ListingCard from '../components/listings/ListingCard';
import ListingDetailModal from '../components/listings/ListingDetailModal';
import ListingFilterBar from '../components/listings/ListingFilterBar';
import ListingSkeleton from '../components/ui/ListingSkeleton';

/**
 * Main campus marketplace discovery feed with pagination and skeleton loading
 */
const Home = () => {
  const { user } = useAuth();
  const { savedIds, count: savedCount } = useWishlist();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Filters & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [isFreeOnly, setIsFreeOnly] = useState(false);
  const [isSavedOnly, setIsSavedOnly] = useState(false);

  // Debounced search to prevent excessive backend querying
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Selected listing for modal quick-view
  const [selectedListing, setSelectedListing] = useState(null);

  const fetchListings = useCallback(
    async (pageToFetch = 1, isAppending = false) => {
      if (isAppending) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError('');

      // If user toggled Saved items only and has none bookmarked yet, avoid network call
      if (isSavedOnly && savedIds.length === 0) {
        setListings([]);
        setPage(1);
        setHasMore(false);
        setTotalCount(0);
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      try {
        const params = {
          page: pageToFetch,
          limit: 8,
        };
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
        if (selectedCategory !== 'All') params.category = selectedCategory;
        if (selectedCondition !== 'All') params.condition = selectedCondition;
        if (selectedStatus) params.status = selectedStatus;
        if (sortBy) params.sort = sortBy;
        if (isFreeOnly) params.isFree = true;
        if (isSavedOnly && savedIds.length > 0) params.ids = savedIds.join(',');

        const res = await API.get('/listings', { params });
        if (res.data?.success && Array.isArray(res.data?.data)) {
          const items = res.data.data;
          if (isAppending) {
            setListings((prev) => [...prev, ...items]);
          } else {
            setListings(items);
          }

          setPage(pageToFetch);
          setHasMore(Boolean(res.data.pagination?.hasMore));
          setTotalCount(res.data.pagination?.total || 0);
        } else {
          if (!isAppending) setListings([]);
          setHasMore(false);
        }
      } catch {
        setError('Unable to load listings. Please check your network connection.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [debouncedSearch, selectedCategory, selectedCondition, selectedStatus, sortBy, isFreeOnly, isSavedOnly, savedIds]
  );

  useEffect(() => {
    fetchListings(1, false);
  }, [fetchListings]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchListings(page + 1, true);
    }
  };

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedCondition('All');
    setSelectedStatus('ALL');
    setSortBy('newest');
    setIsFreeOnly(false);
    setIsSavedOnly(false);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 pt-16 pb-20 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Verified Campus-Only Second Hand Community
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Buy, Sell & Pass Down Items <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Right On Your Campus
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-slate-600 leading-relaxed">
            ReuseCampus connects students to trade textbooks, gadgets, hostel furniture,
            and gear safely within your verified college community. Save money and cut waste!
          </p>

          {/* Quick Hero Search */}
          <div className="max-w-2xl mx-auto mt-6">
            <div className="relative flex items-center bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 p-2 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search calculus books, mini fridge, scientific calculator, cycles..."
                className="w-full px-3 py-2.5 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-sm sm:text-base"
              />
              <a
                href="#browse-feed"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 active:scale-95 shrink-0 cursor-pointer"
              >
                Search
              </a>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-lg shadow-emerald-600/25 transition-all active:scale-95"
            >
              List an Item for Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#browse-feed"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 shadow-sm transition-all"
            >
              Browse Campus Listings
            </a>
          </div>
        </div>
      </section>

      {/* Main Marketplace Feed */}
      <section id="browse-feed" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Campus Marketplace Feed
          </h2>
          <p className="text-sm text-slate-500">
            Fresh second-hand items listed by verified students
          </p>
        </div>

        {/* Modular Filter & Search Bar with Free & Wishlist Quick Toggles */}
        <ListingFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedCondition={selectedCondition}
          onConditionChange={setSelectedCondition}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          sortBy={sortBy}
          onSortChange={setSortBy}
          isFreeOnly={isFreeOnly}
          onToggleFreeOnly={setIsFreeOnly}
          isSavedOnly={isSavedOnly}
          onToggleSavedOnly={setIsSavedOnly}
          savedCount={savedCount}
        />

        {/* Error notification banner */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
            {error}
          </div>
        )}

        {/* Listings Display Grid or Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <ListingSkeleton key={index} />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-4">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <PackageOpen className="w-7 h-7" />
            </div>
            {isSavedOnly ? (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-800">Your Saved Wishlist is Empty</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  You haven't bookmarked any campus items yet. Tap the heart icon on any listing to save it here!
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleResetAllFilters}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset All Filters & Browse Marketplace
                  </button>
                </div>
              </div>
            ) : isFreeOnly ? (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-800">No Free Junior Donations Found</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  No free items match your active filters. Try resetting your filters or donate an item to a junior!
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleResetAllFilters}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer border border-slate-200"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset All Filters
                  </button>
                  <Link
                    to="/create"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all"
                  >
                    🎁 Donate an Item Free
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-800">No campus listings match your criteria</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  Try clearing your search query or resetting your category and condition filters.
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleResetAllFilters}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset All Filters
                  </button>
                  <Link
                    to="/create"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all"
                  >
                    Post an Item
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((item) => (
                <ListingCard
                  key={item._id}
                  item={item}
                  onSelect={setSelectedListing}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                      Loading more items...
                    </>
                  ) : (
                    <>
                      <span>Load More Items</span>
                      {totalCount > 0 && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {listings.length} of {totalCount}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Quick View & Contact Seller Modal */}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          currentUser={user}
        />
      )}

      {/* Sustainable Campus Value Props */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800">Verified College Students</h3>
            <p className="text-sm text-slate-600">
              Only users with official .edu or .ac institutional domains can register and trade.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800">Zero Middleman Commissions</h3>
            <p className="text-sm text-slate-600">
              Direct peer-to-peer exchange. Pay and receive 100% of the agreed price instantly.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800">Sustainable Campus Living</h3>
            <p className="text-sm text-slate-600">
              Reduce campus waste by passing down textbooks, furniture, and gadgets to juniors.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
