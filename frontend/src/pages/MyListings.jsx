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
  Edit3,
  RotateCcw,
  IndianRupee,
  X,
  Check,
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const categories = [
  'Books',
  'Lab Equipment',
  'Electronics',
  'Stationery',
  'Clothing',
  'Bags & Accessories',
  'Furniture',
  'Other',
];

const conditions = ['New', 'Like New', 'Good', 'Fair'];

const MyListings = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [editingListing, setEditingListing] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

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

  // Toggle status between AVAILABLE and SOLD
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'AVAILABLE' ? 'SOLD' : 'AVAILABLE';
    try {
      setActionSuccess('');
      setErrorMessage('');
      const res = await API.patch(`/listings/${id}/status`, { status: newStatus });
      if (res.data?.success) {
        setActionSuccess(`Item marked as ${newStatus}!`);
        setListings((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
        );
      }
    } catch (error) {
      console.error('Toggle status failed:', error);
      setErrorMessage(
        error.response?.data?.message || 'Could not update item status.'
      );
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingListing({
      _id: item._id,
      title: item.title,
      price: item.price,
      category: item.category,
      condition: item.condition,
      description: item.description,
      imageUrl: item.imageUrl,
      status: item.status,
    });
    setErrorMessage('');
    setActionSuccess('');
  };

  // Save Edit Handler
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingListing) return;

    setSavingEdit(true);
    setErrorMessage('');

    try {
      const payload = {
        title: editingListing.title.trim(),
        price: Number(editingListing.price),
        category: editingListing.category,
        condition: editingListing.condition,
        description: editingListing.description.trim(),
        imageUrl: editingListing.imageUrl.trim(),
        status: editingListing.status,
      };

      const res = await API.put(`/listings/${editingListing._id}`, payload);

      if (res.data?.success && res.data?.data) {
        setActionSuccess('Listing updated successfully!');
        setListings((prev) =>
          prev.map((item) => (item._id === editingListing._id ? res.data.data : item))
        );
        setEditingListing(null);
      }
    } catch (error) {
      console.error('Failed to update listing:', error);
      setErrorMessage(
        error.response?.data?.message || 'Failed to update listing. Please check your inputs.'
      );
    } finally {
      setSavingEdit(false);
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
                <button
                  type="button"
                  onClick={() => handleToggleStatus(item._id, item.status)}
                  className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-md transition-transform active:scale-95 cursor-pointer ${
                    item.status === 'AVAILABLE'
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-slate-700 hover:bg-slate-800 text-white'
                  }`}
                  title="Click to toggle status"
                >
                  {item.status} ↺
                </button>
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
                    {/* Toggle Status Action Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item._id, item.status)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                        item.status === 'AVAILABLE'
                          ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                      }`}
                      title={item.status === 'AVAILABLE' ? 'Mark as SOLD' : 'Re-list as AVAILABLE'}
                    >
                      {item.status === 'AVAILABLE' ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          Mark Sold
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" />
                          Re-list
                        </>
                      )}
                    </button>

                    {/* Edit Listing Action Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Item Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Listing Action Button */}
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

      {/* Edit Listing Modal */}
      {editingListing && (
        <div
          onClick={() => setEditingListing(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 relative my-8"
          >
            <button
              onClick={() => setEditingListing(null)}
              type="button"
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 uppercase tracking-wider">
                Seller Dashboard
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2">Edit Listing Details</h3>
              <p className="text-xs text-slate-500">Update item pricing, status, or description</p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Item Title *
                </label>
                <input
                  type="text"
                  value={editingListing.title}
                  onChange={(e) =>
                    setEditingListing({ ...editingListing, title: e.target.value })
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={editingListing.category}
                    onChange={(e) =>
                      setEditingListing({ ...editingListing, category: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Condition *
                  </label>
                  <select
                    value={editingListing.condition}
                    onChange={(e) =>
                      setEditingListing({ ...editingListing, condition: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {conditions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Price (₹) *
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="0"
                      value={editingListing.price}
                      onChange={(e) =>
                        setEditingListing({ ...editingListing, price: e.target.value })
                      }
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Status *
                  </label>
                  <select
                    value={editingListing.status}
                    onChange={(e) =>
                      setEditingListing({ ...editingListing, status: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="SOLD">SOLD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Image URL / Photo
                </label>
                <input
                  type="text"
                  value={editingListing.imageUrl}
                  onChange={(e) =>
                    setEditingListing({ ...editingListing, imageUrl: e.target.value })
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  value={editingListing.description}
                  onChange={(e) =>
                    setEditingListing({ ...editingListing, description: e.target.value })
                  }
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingListing(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  {savingEdit ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyListings;


