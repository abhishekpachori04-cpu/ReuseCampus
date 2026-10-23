import React, { useState } from 'react';
import { Clock, Heart, CheckCircle2, ArrowRight } from 'lucide-react';
import useWishlist from '../../hooks/useWishlist';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

/**
 * Luxury Airbnb/Gumroad-Style Marketplace Listing Card
 */
const ListingCard = ({ item, onSelect }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();

  const isSold = item.status === 'SOLD';
  const isFree = Number(item.price) === 0;
  const isSaved = isWishlisted(item._id);

  const sellerInitial = item.seller?.name ? item.seller.name.charAt(0).toUpperCase() : 'S';
  const sellerName = item.seller?.name || 'RJIT Student';

  return (
    <article
      onClick={() => onSelect(item)}
      className={`group bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500/40 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-[0_20px_30px_-10px_rgba(15,23,42,0.1)] transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col cursor-pointer relative ${
        isSold ? 'opacity-85' : ''
      }`}
    >
      {/* Image Container with Aspect Ratio 4/3 */}
      <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.title}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${isSold ? 'grayscale-[30%]' : ''}`}
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
            setIsLoaded(true);
          }}
        />

        {/* Top-Left Category Pill & Free Tag */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10 max-w-[75%]">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold backdrop-blur-md bg-white/90 text-slate-800 border border-slate-200/90 shadow-sm">
            {item.category}
          </span>
          {isFree && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md border border-emerald-400/40">
              🎁 FREE
            </span>
          )}
        </div>

        {/* Top-Right Heart Wishlist Button */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(item._id);
            }}
            aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md ${
              isSaved
                ? 'bg-white text-rose-500 shadow-rose-500/20 scale-105'
                : 'bg-white/80 text-slate-500 hover:text-rose-500 hover:bg-white hover:scale-105'
            }`}
            title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart
              className={`w-4 h-4 transition-transform duration-200 ${
                isSaved ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
          </button>
        </div>

        {/* Sold Overlay */}
        {isSold && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
            <span className="px-3.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs tracking-widest uppercase shadow-lg border border-amber-300">
              SOLD OUT
            </span>
          </div>
        )}
      </div>

      {/* Card Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Metadata pill & Timestamp */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md text-[11px]">
              {item.condition}
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <Clock className="w-3 h-3 text-slate-400" />
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {item.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Pricing Area */}
        <div className="pt-2">
          {isFree ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold text-xs sm:text-sm border border-emerald-200 shadow-sm">
              🎁 FREE FOR JUNIORS
            </span>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-xl sm:text-2xl font-bold text-slate-900">
                ₹{item.price.toLocaleString()}
              </span>
              <span className="text-[11px] font-medium text-slate-400">campus deal</span>
            </div>
          )}
        </div>

        {/* Card Footer: Seller Avatar with Gradient Ring & View Details */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Seller avatar initial with gradient ring */}
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 p-[1.5px] shrink-0">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-slate-800">
                {sellerInitial}
              </div>
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-xs font-semibold text-slate-700 truncate max-w-[110px]">
                {sellerName}
              </span>
              <CheckCircle2
                className="w-3.5 h-3.5 text-emerald-600 shrink-0"
                title="Verified RJIT"
              />
            </div>
          </div>

          {/* Subtle View Details indicator */}
          <div className="text-xs font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 shrink-0">
            <span>Details</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </article>
  );
};

export default ListingCard;
