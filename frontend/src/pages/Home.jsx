import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import API from '../services/api';

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

const Home = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [selectedListing, setSelectedListing] = useState(null); // for seller contact modal
  const [error, setError] = useState('');

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedCondition !== 'All') params.condition = selectedCondition;

      const res = await API.get('/listings', { params });
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setListings(res.data.data);
      } else {
        setListings([]);
      }
    } catch (err) {
      console.error('Failed to load listings:', err);
      setError('Failed to load listings from campus network.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedCondition]);

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

          {/* Condition Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Condition:</span>
            <div className="flex flex-wrap gap-1">
              {conditions.map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setSelectedCondition(cond)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
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

        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
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
                Try clearing search terms or selecting a different category filter. Or be the first
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
            {listings.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all flex flex-col group"
              >
                {/* Image */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                    className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm ${
                      item.status === 'AVAILABLE'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-white'
                    }`}
                  >
                    {item.status}
                  </span>
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

                      <button
                        type="button"
                        onClick={() => setSelectedListing(item)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Contact Seller
                      </button>
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
            ))}
          </div>
        )}
      </section>

      {/* Seller Contact Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setSelectedListing(null)}
              type="button"
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 uppercase tracking-wider">
                Seller Contact
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2">{selectedListing.title}</h3>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                {selectedListing.price === 0 ? 'FREE' : `₹${selectedListing.price.toLocaleString()}`}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  {selectedListing.seller?.name ? selectedListing.seller.name.charAt(0) : 'S'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    {selectedListing.seller?.name || 'Campus Student'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {selectedListing.seller?.college || 'Verified Campus Member'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                  <a
                    href={`mailto:${selectedListing.seller?.email}`}
                    className="text-emerald-700 hover:underline font-medium truncate"
                  >
                    {selectedListing.seller?.email || 'N/A'}
                  </a>
                </div>

                {selectedListing.seller?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <a
                      href={`tel:${selectedListing.seller.phone}`}
                      className="text-slate-800 font-medium"
                    >
                      {selectedListing.seller.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={`mailto:${selectedListing.seller?.email}?subject=Interested in ${encodeURIComponent(selectedListing.title)} on ReuseCampus`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-600/20"
              >
                <Mail className="w-4 h-4" />
                Email Student
              </a>
              {selectedListing.seller?.phone && (
                <a
                  href={`https://wa.me/${selectedListing.seller.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200 transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
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

