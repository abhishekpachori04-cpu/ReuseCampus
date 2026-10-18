import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  PlusCircle,
  CheckCircle,
  Clock,
  Trash2,
  AlertCircle,
  Loader2,
  ShoppingBag,
  Lock,
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyListings = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchMyListings = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // Backend supports GET /api/listings/my
      const res = await API.get('/listings/my');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setListings(res.data.data);
      } else {
        setListings([]);
      }
    } catch (error) {
      console.error('Failed to fetch user listings:', error);
      setErrorMessage(
        error.response?.data?.message || 'Could not load your listings. Please refresh.'
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) {
      fetchMyListings();
    }
  }, [authLoading, fetchMyListings]);

  // Mark as sold handler
  const handleMarkSold = async (id) => {
    try {
      setActionSuccess('');
      setErrorMessage('');
      const res = await API.patch(`/listings/${id}/sold`);
      if (res.data?.success) {
        setActionSuccess('Item successfully marked as SOLD!');
        // Update local listing status
        setListings((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: 'SOLD' } : item))
        );
      }
    } catch (error) {
      console.error('Mark as sold failed:', error);
      setErrorMessage(
        error.response?.data?.message || 'Could not update item status to SOLD.'
      );
    }
  };

  // Delete listing handler
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }

    try {
      setActionSuccess('');
      setErrorMessage('');
      const res = await API.delete(`/listings/${id}`);
      if (res.data?.success) {
        setActionSuccess('Listing deleted successfully!');
        setListings((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (error) {
      console.error('Delete listing failed:', error);
      setErrorMessage(
        error.response?.data?.message || 'Could not remove listing. Please try again.'
      );
    }
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Sign in to view your listings</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            You need a verified campus student account to manage your listings and sales.
          </p>
        </div>
        <Link
          to="/login"
          state={{ from: { pathname: '/my-listings' } }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/25 transition-all"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Package className="w-3.5 h-3.5" />
            Seller Dashboard
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Campus Listings
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your active items, mark as sold, or post new second-hand essentials.
          </p>
        </div>

        <Link
          to="/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/25 transition-all shrink-0 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          Post New Item
        </Link>
      </div>

      {actionSuccess && (
        <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading your campus listings...</p>
        </div>
      ) : listings.length === 0 ? (
        /* Empty State */
        <div className="py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-4">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">No listings posted yet</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1">
              Have textbooks, calculators, furniture, or stationery you don't need anymore? Pass them
              on to fellow students!
            </p>
          </div>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Create Your First Listing
          </Link>
        </div>
      ) : (
        /* Listings Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="relative h-48 w-full bg-slate-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <span
                  className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm ${
                    item.status === 'AVAILABLE'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-700 text-white'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold text-emerald-700">{item.category}</span>
                    <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {item.condition}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base line-clamp-1">{item.title}</h3>
                  <p className="text-xl font-extrabold text-emerald-700 mt-2">
                    {item.price === 0 ? 'FREE' : `₹${item.price.toLocaleString()}`}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    {item.status === 'AVAILABLE' && (
                      <button
                        type="button"
                        onClick={() => handleMarkSold(item._id)}
                        className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title="Mark as SOLD"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Mark Sold
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id, item.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;

