import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  X,
  Clock,
  ShieldCheck,
  GraduationCap,
  Mail,
  Phone,
  MessageCircle,
  Copy,
  CheckCircle,
  Sparkles,
  Edit,
  AlertCircle,
} from 'lucide-react';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';

/**
 * 2-Column Quick View & Seller Contact Modal
 */
const ListingDetailModal = ({ listing, onClose, currentUser }) => {
  const [copiedContact, setCopiedContact] = useState(false);

  // Lock body scroll and register escape key dismiss listener
  useEffect(() => {
    if (!listing) return;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [listing, onClose]);

  if (!listing) return null;

  const isSold = listing.status === 'SOLD';
  const isFree = listing.price === 0;
  const isOwner =
    currentUser?._id &&
    String(listing.seller?._id || listing.seller) === String(currentUser._id);

  const sellerName = listing.seller?.name || 'Campus Student';
  const sellerCollege = listing.seller?.college || 'RJIT Tekanpur';
  const sellerEmail = listing.seller?.email || 'N/A';
  const sellerPhone = listing.seller?.phone || '';

  const copySellerDetails = (additionalTag = '') => {
    const formatted = `Seller: ${sellerName}\nCollege: ${sellerCollege}\nEmail: ${sellerEmail}\nPhone: ${
      sellerPhone || 'N/A'
    }\nItem: ${listing.title} (${isFree ? 'FREE' : `₹${listing.price}`})${
      additionalTag ? ` - ${additionalTag}` : ''
    }`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(formatted).catch(() => {});
    }
    setCopiedContact(true);
    setTimeout(() => setCopiedContact(false), 2500);
  };

  const getWhatsAppLink = () => {
    if (!sellerPhone) return '';
    const cleanDigits = sellerPhone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
    const message = encodeURIComponent(
      `Hi, I am interested in your listing "${listing.title}" on ReuseCampus!`
    );
    return `https://wa.me/${phoneWithCountry}?text=${message}`;
  };

  const getEmailLink = () => {
    const subject = encodeURIComponent(`ReuseCampus: Interested in ${listing.title}`);
    const body = encodeURIComponent(
      `Hi ${sellerName},\n\nI saw your listing for "${listing.title}" (${
        isFree ? 'FREE / DONATION' : `₹${listing.price}`
      }) on ReuseCampus and would like to buy it.\n\nPlease let me know when and where on campus we can meet.\n\nThank you!`
    );
    return `mailto:${sellerEmail}?subject=${subject}&body=${body}`;
  };

  return createPortal(
    <div
      id="product-detail-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 w-screen h-screen z-[999] bg-slate-900/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fadeIn"
    >
      <div
        id="product-detail-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[88vh] border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col md:flex-row relative my-auto text-left"
      >
        {/* Close Button */}
        <button
          id="modal-close-button"
          onClick={onClose}
          type="button"
          aria-label="Close Modal"
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-700 hover:text-slate-900 shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Product Image & Badges */}
        <div className="md:w-5/12 bg-slate-100/90 flex flex-col items-center justify-center p-5 sm:p-6 relative min-h-[220px] md:min-h-0 border-b md:border-b-0 md:border-r border-slate-200/80">
          <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 z-10 max-w-[80%]">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-slate-800 shadow-sm border border-slate-200/60">
              {listing.category}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm uppercase ${
                listing.status === 'AVAILABLE'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              {listing.status}
            </span>
          </div>

          <div className="w-full h-full flex items-center justify-center py-6 md:py-2 relative">
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className={`max-h-[240px] md:max-h-[360px] w-full object-contain rounded-2xl drop-shadow-sm transition-transform duration-300 hover:scale-[1.02] ${
                isSold ? 'grayscale-[30%]' : ''
              }`}
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
            {isSold && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="px-4 py-1.5 rounded-xl bg-amber-600 text-white font-black text-sm tracking-widest uppercase shadow-lg border border-amber-400/40">
                  SOLD OUT
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Listing Details & Seller Actions */}
        <div className="md:w-7/12 p-6 sm:p-7 overflow-y-auto flex flex-col justify-between max-h-[88vh] space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 pr-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Condition: {listing.condition}
                </span>
                {isOwner && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Your Listing
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                {new Date(listing.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {listing.title}
              </h3>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
                {isFree ? 'FREE / DONATION' : `₹${listing.price.toLocaleString()}`}
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 max-h-32 overflow-y-auto">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Item Description
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {listing.description}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {/* Seller Contact Card */}
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
                  {sellerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">
                    {sellerName}
                  </h4>
                  <p className="text-xs text-slate-600 flex items-center gap-1 truncate">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{sellerCollege}</span>
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200/60 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-medium truncate">{sellerEmail}</span>
                </div>

                {sellerPhone && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-medium">{sellerPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Notification Toast */}
            {copiedContact && (
              <div className="flex items-center gap-2 p-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl justify-center animate-fadeIn">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Seller contact details copied to clipboard!
              </div>
            )}

            {/* Action Buttons */}
            {isOwner ? (
              <div className="space-y-2">
                <Link
                  to="/my-listings"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/25 transition-all active:scale-95 cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                  Manage in My Listings
                </Link>
                <button
                  type="button"
                  onClick={() => copySellerDetails()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Listing Details
                </button>
              </div>
            ) : isSold ? (
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
                  onClick={() => copySellerDetails('SOLD')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Seller Details
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {sellerPhone ? (
                    <a
                      href={getWhatsAppLink()}
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

                  <a
                    href={getEmailLink()}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md shadow-slate-900/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    Send Email
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => copySellerDetails()}
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
  );
};

export default ListingDetailModal;
