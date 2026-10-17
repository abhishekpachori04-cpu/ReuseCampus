import React from 'react';
import { Link } from 'react-router-dom';
import { Package, PlusCircle, CheckCircle, Clock, Trash2, Edit3 } from 'lucide-react';

const mockListings = [
  {
    id: '1',
    title: 'Scientific Calculator TI-84 Plus CE',
    category: 'Electronics',
    price: 3500,
    condition: 'Like New',
    status: 'AVAILABLE',
    imageUrl: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48f?auto=format&fit=crop&w=600&q=80',
    createdAt: '2 days ago',
  },
  {
    id: '2',
    title: 'Ergonomic Hostel Study Desk Chair',
    category: 'Furniture',
    price: 1800,
    condition: 'Good',
    status: 'SOLD',
    imageUrl: 'https://images.unsplash.com/photo-1580481077195-c3a82da91609?auto=format&fit=crop&w=600&q=80',
    createdAt: '1 week ago',
  },
];

const MyListings = () => {
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

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockListings.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="relative h-48 w-full bg-slate-100">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
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
                  <span>{item.category}</span>
                  <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {item.condition}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-xl font-extrabold text-emerald-700 mt-2">
                  ₹{item.price.toLocaleString()}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {item.createdAt}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-slate-50"
                    title="Edit Listing"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-50"
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
    </div>
  );
};

export default MyListings;
