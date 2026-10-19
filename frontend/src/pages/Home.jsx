import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Laptop,
  Armchair,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Coins,
  RefreshCw,
  Clock,
  User,
  GraduationCap,
  Phone,
  Mail,
  X,
  Loader2,
  PackageOpen,
  CheckCircle,
  Copy,
  MessageCircle,
  ExternalLink,
  Edit,
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const categories = [
  'All',
  'Books',
  'Lab Equipment',
  'Electronics',
  'Stationery',
  'Clothing',
  'Bags & Accessories',
  'Furniture',
  'Other',
];

const conditions = ['All', 'New', 'Like New', 'Good', 'Fair'];
const statuses = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Available', value: 'AVAILABLE' },
  { label: 'Sold', value: 'SOLD' },
];

const Home = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedListing, setSelectedListing] = useState(null); // for seller contact modal
  const [copiedContact, setCopiedContact] = useState(false);
  const [error, setError] = useState('');

  // Lock body scroll and listen for Escape key when modal is open
  useEffect(() => {
    if (selectedListing) {
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setSelectedListing(null);
          setCopiedContact(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedListing]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedCondition !== 'All') params.condition = selectedCondition;
      if (selectedStatus) params.status = selectedStatus;

      const res = await API.get('/listings', { params });
      if (res.data?.success && Array.isArray(res.data?.data)) {
        let items = res.data.data;
        // Prioritize AVAILABLE items first, followed by SOLD items
        if (selectedStatus === 'ALL') {
          items = [...items].sort((a, b) => {
            if (a.status === 'AVAILABLE' && b.status === 'SOLD') return -1;
            if (a.status === 'SOLD' && b.status === 'AVAILABLE') return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
        }
        setListings(items);
      } else {
        setListings([]);
      }
    } catch (err) {
      console.error('Failed to load listings:', err);
      setError('Failed to load listings from campus network.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedCondition, selectedStatus]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchListings();
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

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mt-6">
            <div className="relative flex items-center bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 p-2 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search calculus books, mini fridge, scientific calculator, cycles..."
                className="w-full px-3 py-2.5 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-sm sm:text-base"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 active:scale-95 shrink-0 cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Action CTAs */}
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

      {/* Main Marketplace Section */}
      <section id="browse-feed" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Campus Marketplace Feed
            </h2>
            <p className="text-sm text-slate-500">
              Fresh second-hand items listed by verified students
            </p>
          </div>

          {/* Filter Toolbar: Status and Condition */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase">Status:</span>
              <div className="flex flex-wrap gap-1">
                {statuses.map((st) => (
                  <button
                    key={st.value}
                    type="button"
                    onClick={() => setSelectedStatus(st.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedStatus === st.value
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase">Condition:</span>
              <div className="flex flex-wrap gap-1">
                {conditions.map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setSelectedCondition(cond)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      selectedCondition === cond
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
            {error}
          </div>
        )}

        {/* Listings Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm">Fetching verified listings from campus...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-4">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <PackageOpen className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">No listings found</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1">
                Try clearing search terms or selecting a different status/category filter. Or be the first
                to list an item!
              </p>
            </div>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all"
            >
              Post an Item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((item) => {
              const isSold = item.status === 'SOLD';

              return (
                <div
                  key={item._id}
                  onClick={() => setSelectedListing(item)}
                  className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col group cursor-pointer ${
                    isSold
                      ? 'border-slate-200 hover:border-amber-300 opacity-90'
                      : 'border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  {/* Image */}
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                        isSold ? 'grayscale-[35%]' : ''
                      }`}
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-md text-slate-700 shadow-sm">
                        {item.category}
                      </span>
                    </div>

                    <span
                      className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase shadow-sm tracking-wider ${
                        isSold
                          ? 'bg-amber-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {item.status}
                    </span>

                    {/* Sold overlay watermark */}
                    {isSold && (
                      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[0.5px] flex items-center justify-center pointer-events-none">
                        <span className="px-3 py-1 rounded-lg bg-amber-600 text-white font-black text-xs tracking-widest uppercase shadow-md border border-amber-400/40">
                          SOLD OUT
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-600">
                          {item.condition}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-emerald-700 transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    </div>

                    {/* Price and Seller */}
                    <div className="pt-3 border-t border-slate-100 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-black text-emerald-700">
                          {item.price === 0 ? 'FREE' : `₹${item.price.toLocaleString()}`}
                        </span>

                        {isSold ? (
                          <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200">
                            Sold Out
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedListing(item);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Contact Seller
                          </button>
                        )}
                      </div>

                      {item.seller && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{item.seller.college || item.seller.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Product Detail & Seller Contact Modal rendered via Portal at root */}
      {selectedListing &&
        createPortal(
          <div
            id="product-detail-modal-backdrop"
            onClick={() => {
              setSelectedListing(null);
              setCopiedContact(false);
            }}
            className="fixed inset-0 w-screen h-screen z-[999] bg-slate-900/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fadeIn"
          >
            <div
              id="product-detail-modal-card"
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[88vh] border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col md:flex-row relative my-auto text-left"
            >
              {/* Close Button - prominent circular button fixed top-right */}
              <button
                id="modal-close-button"
                onClick={() => {
                  setSelectedListing(null);
                  setCopiedContact(false);
                }}
                type="button"
                aria-label="Close Modal"
                className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-700 hover:text-slate-900 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>

              {/* LEFT COLUMN: Product Image & Badges (md:w-5/12) */}
              <div className="md:w-5/12 bg-slate-100/90 flex flex-col items-center justify-center p-5 sm:p-6 relative min-h-[220px] md:min-h-0 border-b md:border-b-0 md:border-r border-slate-200/80">
                {/* Top Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 z-10 max-w-[80%]">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-slate-800 shadow-sm border border-slate-200/60">
                    {selectedListing.category}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm uppercase ${
                      selectedListing.status === 'AVAILABLE'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    {selectedListing.status}
                  </span>
                </div>

                {/* Product Image - object-contain prevents awkward cropping of tall or wide photos */}
                <div className="w-full h-full flex items-center justify-center py-6 md:py-2 relative">
                  <img
                    src={selectedListing.imageUrl}
                    alt={selectedListing.title}
                    className={`max-h-[240px] md:max-h-[360px] w-full object-contain rounded-2xl drop-shadow-sm transition-transform duration-300 hover:scale-[1.02] ${
                      selectedListing.status === 'SOLD' ? 'grayscale-[30%]' : ''
                    }`}
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  {selectedListing.status === 'SOLD' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="px-4 py-1.5 rounded-xl bg-amber-600 text-white font-black text-sm tracking-widest uppercase shadow-lg border border-amber-400/40">
                        SOLD OUT
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Details & Actions (md:w-7/12) */}
              <div className="md:w-7/12 p-6 sm:p-7 overflow-y-auto flex flex-col justify-between max-h-[88vh] space-y-5">
                {/* Header: Condition, Date, Title, Price */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2 pr-10">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Condition: {selectedListing.condition}
                      </span>
                      {user?._id &&
                        String(selectedListing.seller?._id || selectedListing.seller) === String(user._id) && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            Your Listing
                          </span>
                        )}
                    </div>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(selectedListing.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                      {selectedListing.title}
                    </h3>
                    <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
                      {selectedListing.price === 0
                        ? 'FREE / DONATION'
                        : `₹${selectedListing.price.toLocaleString()}`}
                    </p>
                  </div>

                  {/* Description Box */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 max-h-32 overflow-y-auto">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Item Description
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                      {selectedListing.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Section: Seller Card & Action Buttons */}
                <div className="space-y-4 pt-2">
                  {/* Verified Campus Seller Card */}
                  <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Verified Campus Seller
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                        Student ID Verified
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                        {selectedListing.seller?.name
                          ? selectedListing.seller.name.charAt(0).toUpperCase()
                          : 'S'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate">
                          {selectedListing.seller?.name || 'Campus Student'}
                        </h4>
                        <p className="text-xs text-slate-600 flex items-center gap-1 truncate">
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">
                            {selectedListing.seller?.college || 'RJIT Tekanpur'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-200/60 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-medium truncate">
                          {selectedListing.seller?.email || 'N/A'}
                        </span>
                      </div>

                      {selectedListing.seller?.phone && (
                        <div className="flex items-center gap-2 text-slate-700">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-medium">{selectedListing.seller.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Copy Feedback Toast */}
                  {copiedContact && (
                    <div className="flex items-center gap-2 p-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl justify-center animate-fadeIn">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      Seller contact details copied to clipboard!
                    </div>
                  )}

                  {/* Owner quick action vs Buyer contact buttons */}
                  {user?._id &&
                  String(selectedListing.seller?._id || selectedListing.seller) === String(user._id) ? (
                    <div className="space-y-2">
                      <Link
                        to="/my-listings"
                        onClick={() => setSelectedListing(null)}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/25 transition-all active:scale-95 cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                        Manage in My Listings
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          const textToCopy = `Seller: ${selectedListing.seller?.name || 'Campus Student'}\nCollege: ${selectedListing.seller?.college || 'RJIT'}\nEmail: ${selectedListing.seller?.email || 'N/A'}\nPhone: ${selectedListing.seller?.phone || 'N/A'}\nItem: ${selectedListing.title} (₹${selectedListing.price})`;
                          if (navigator?.clipboard?.writeText) {
                            navigator.clipboard.writeText(textToCopy).catch(() => {});
                          }
                          setCopiedContact(true);
                          setTimeout(() => setCopiedContact(false), 2500);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy Listing Details
                      </button>
                    </div>
                  ) : selectedListing.status === 'SOLD' ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>This item has already been sold and is no longer available on campus.</span>
                      </div>

                      <button
                        type="button"
                        disabled
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 font-bold text-xs cursor-not-allowed select-none"
                      >
                        <MessageCircle className="w-4 h-4 text-slate-400" />
                        This item has already been sold
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const textToCopy = `Seller: ${selectedListing.seller?.name || 'Campus Student'}\nCollege: ${selectedListing.seller?.college || 'RJIT'}\nEmail: ${selectedListing.seller?.email || 'N/A'}\nPhone: ${selectedListing.seller?.phone || 'N/A'}\nItem: ${selectedListing.title} (₹${selectedListing.price}) - SOLD`;
                          if (navigator?.clipboard?.writeText) {
                            navigator.clipboard.writeText(textToCopy).catch(() => {});
                          }
                          setCopiedContact(true);
                          setTimeout(() => setCopiedContact(false), 2500);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy Seller Details
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* WhatsApp Button */}
                        {selectedListing.seller?.phone ? (
                          <a
                            href={`https://wa.me/${(() => {
                              const clean = selectedListing.seller.phone.replace(/[^0-9]/g, '');
                              return clean.length === 10 ? `91${clean}` : clean;
                            })()}?text=${encodeURIComponent(
                              `Hi, I am interested in your listing "${selectedListing.title}" on ReuseCampus!`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/25 transition-all active:scale-95 cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Chat on WhatsApp
                          </a>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-slate-100 text-slate-400 font-medium text-xs">
                            <Phone className="w-4 h-4" />
                            WhatsApp Not Provided
                          </div>
                        )}

                        {/* Email Button */}
                        <a
                          href={`mailto:${selectedListing.seller?.email}?subject=${encodeURIComponent(
                            `ReuseCampus: Interested in ${selectedListing.title}`
                          )}&body=${encodeURIComponent(
                            `Hi ${selectedListing.seller?.name || 'Seller'},\n\nI saw your listing for "${selectedListing.title}" (₹${selectedListing.price}) on ReuseCampus and would like to buy it.\n\nPlease let me know when and where on campus we can meet.\n\nThank you!`
                          )}`}
                          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md shadow-slate-900/20 transition-all active:scale-95 cursor-pointer"
                        >
                          <Mail className="w-4 h-4" />
                          Send Email
                        </a>
                      </div>

                      {/* Copy Contact Info Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const textToCopy = `Seller: ${selectedListing.seller?.name || 'Campus Student'}\nCollege: ${selectedListing.seller?.college || 'RJIT'}\nEmail: ${selectedListing.seller?.email || 'N/A'}\nPhone: ${selectedListing.seller?.phone || 'N/A'}\nItem: ${selectedListing.title} (₹${selectedListing.price})`;
                          if (navigator?.clipboard?.writeText) {
                            navigator.clipboard.writeText(textToCopy).catch(() => {});
                          }
                          setCopiedContact(true);
                          setTimeout(() => setCopiedContact(false), 2500);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy Contact Info
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Feature Highlights */}
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

