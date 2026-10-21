import React, { useState } from 'react';
import { Clock, GraduationCap, Heart } from 'lucide-react';
import useWishlist from '../../hooks/useWishlist';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

/**
 * Marketplace Listing Card Component with Wishlist & Free Donation Badge
 */
const ListingCard = ({ item, onSelect }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();

  const isSold = item.status === 'SOLD';
  const isFree = Number(item.price) === 0;
  const isSaved = isWishlisted(item._id);

  return (
    <article
      onClick={() => onSelect(item)}
      className={`group bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col cursor-pointer relative ${
        isSold
          ? 'border-slate-200 hover:border-amber-300 opacity-90'
          : 'border-slate-200 hover:border-emerald-300'
      }`}
    >
      {/* Product Image & Floating Badges */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.title}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${isSold ? 'grayscale-[35%]' : ''}`}
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
            setIsLoaded(true);
          }}
        />

        {/* Top-Left Badges: Category & Standout Free Donation Tag */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10 max-w-[70%]">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-md text-slate-700 shadow-sm border border-slate-200/50">
            {item.category}
          </span>
          {isFree && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-600 text-white shadow-md flex items-center gap-1 border border-emerald-500/50 animate-pulse-subtle">
              🎁 FREE FOR JUNIORS
            </span>
          )}
        </div>

        {/* Top-Right: Wishlist Heart & Status Tag */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(item._id);
            }}
            aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md ${
              isSaved
                ? 'bg-white text-rose-500 shadow-rose-500/30 scale-105'
                : 'bg-white/85 text-slate-400 hover:text-rose-500 hover:bg-white hover:scale-110'
            }`}
            title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart
              className={`w-4 h-4 transition-transform duration-200 ${
                isSaved ? 'fill-rose-500 text-rose-500 scale-110' : ''
              }`}
            />
          </button>
        </div>

        {/* Sold Overlay */}
        {isSold && (
          <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-[0.5px] flex items-center justify-center pointer-events-none">
            <span className="px-3.5 py-1 rounded-lg bg-amber-600 text-white font-black text-xs tracking-widest uppercase shadow-md border border-amber-400/40">
              SOLD OUT
            </span>
          </div>
        )}
      </div>

      {/* Body Details */}
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

        {/* Pricing and Action Footer */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            {isFree ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold text-xs sm:text-sm border border-emerald-200 shadow-sm">
                🎁 FREE FOR JUNIORS
              </span>
            ) : (
              <span className="text-xl font-black text-emerald-700">
                ₹{item.price.toLocaleString()}
              </span>
            )}

            {isSold ? (
              <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200">
                Sold Out
              </span>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(item);
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
    </article>
  );
};

export default ListingCard;
