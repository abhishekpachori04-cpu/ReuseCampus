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
  Heart,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import useWishlist from '../../hooks/useWishlist';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';

/**
 * 2-Column Luxury Quick View & Seller Contact Modal
 */
const ListingDetailModal = ({ listing, onClose, currentUser }) => {
  const [copiedContact, setCopiedContact] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();

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
  const isFree = Number(listing.price) === 0;
  const isSaved = isWishlisted(listing._id);
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

  // Native Web Share with Clipboard Fallback
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/?item=${listing._id}`;
    const priceText = isFree ? 'FREE' : `₹${listing.price}`;
    const shareData = {
      title: listing.title,
      text: `${listing.title} - ${priceText} (${listing.condition}) on ReuseCampus RJIT`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: Copy link to clipboard
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2400);
    } catch {
      // ignore
    }
  };

  return createPortal(
    <div
      id="product-detail-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 w-screen h-screen z-[999] bg-slate-950/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fadeIn"
    >
      <div
        id="product-detail-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[88vh] border border-slate-200 shadow-2xl overflow-hidden flex flex-col md:flex-row relative my-auto text-left"
      >
        {/* Sleek Top-Left Back Button */}
        <button
          id="modal-back-button"
          onClick={onClose}
          type="button"
          aria-label="Go Back"
          className="absolute top-4 left-4 z-30 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 shadow-sm border border-slate-200/90 transition-all cursor-pointer active:scale-95 text-xs font-bold backdrop-blur-md group"
          title="Go back"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>

        {/* Top-Right Control Actions: Share, Save, Close */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          {/* Share Button */}
          <button
            id="modal-share-button"
            onClick={handleShare}
            type="button"
            aria-label="Share Listing"
            className="px-3 py-1.5 rounded-full bg-white/95 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/90 shadow-sm transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 text-xs font-bold"
            title="Share listing"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Wishlist Bookmark Button */}
          <button
            onClick={() => toggleWishlist(listing._id)}
            type="button"
            aria-label={isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
            className={`px-3 py-1.5 rounded-full shadow-sm transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 text-xs font-bold ${
              isSaved
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-white/95 hover:bg-rose-50 hover:text-rose-600 text-slate-700 border border-slate-200/90'
            }`}
            title={isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isSaved ? 'fill-rose-500 text-rose-500 scale-110' : ''
              }`}
            />
            <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          {/* Close Button */}
          <button
            id="modal-close-button"
            onClick={onClose}
            type="button"
            aria-label="Close Modal"
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 shadow-sm transition-all cursor-pointer active:scale-95"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Toast Notification for Link Copied */}
        {shareToast && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold rounded-2xl shadow-2xl border border-emerald-500/30 animate-fadeIn pointer-events-none">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Listing Link Copied to Clipboard!</span>
          </div>
        )}

        {/* Left Column: Product Image & Badges */}
        <div className="md:w-5/12 bg-slate-50 flex flex-col items-center justify-center p-5 sm:p-6 relative min-h-[220px] md:min-h-0 border-b md:border-b-0 md:border-r border-slate-200">
          <div className="absolute top-14 left-4 flex flex-wrap gap-1.5 z-10 max-w-[80%]">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-slate-800 shadow-sm border border-slate-200/60">
              {listing.category}
            </span>
            {isFree && (
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md flex items-center gap-1 border border-emerald-400/40">
                🎁 FREE FOR JUNIORS
              </span>
            )}
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm uppercase ${
                listing.status === 'AVAILABLE'
                  ? 'bg-slate-900 text-white'
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
                <span className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-sm tracking-widest uppercase shadow-lg border border-amber-300">
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
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  Condition: {listing.condition}
                </span>
                {isOwner && (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
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
              <div className="mt-2">
                {isFree ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-800 font-black text-base sm:text-lg border border-emerald-300 shadow-sm">
                    🎁 FREE FOR JUNIORS
                  </span>
                ) : (
                  <p className="font-mono text-2xl sm:text-3xl font-bold text-slate-900">
                    ₹{listing.price.toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 max-h-32 overflow-y-auto">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Item Description
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {listing.description}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {/* Seller Contact Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Campus Seller
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200/60">
                  Student ID Verified
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                  {sellerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">
                    {sellerName}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{sellerCollege}</span>
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/70 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium truncate">{sellerEmail}</span>
                </div>

                {sellerPhone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
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
