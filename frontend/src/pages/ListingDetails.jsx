import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  CheckCircle2,
  Clock,
  ShieldCheck,
  GraduationCap,
  Mail,
  Phone,
  MessageCircle,
  Copy,
  CheckCircle,
  Sparkles,
  Share2,
  AlertCircle,
  Heart,
  Tag,
} from 'lucide-react';
import API from '../services/api';
import useAuth from '../context/useAuth';
import useWishlist from '../context/useWishlist';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80';

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSaved: checkIsSaved, toggleSaveItem } = useWishlist();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [copiedContact, setCopiedContact] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Fetch listing details and trigger view counter increment
  useEffect(() => {
    let isMounted = true;

    const fetchListing = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await API.get(`/listings/${id}`);
        if (isMounted && res.data?.success && res.data?.data) {
          setListing(res.data.data);
        } else if (isMounted) {
          setError('Listing not found or has been removed.');
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message || 'Failed to load listing details. Please try again.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchListing();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-32 bg-slate-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-6 h-96 bg-slate-200 rounded-3xl"></div>
            <div className="md:col-span-6 space-y-4">
              <div className="h-8 bg-slate-200 rounded-xl w-3/4"></div>
              <div className="h-6 bg-slate-200 rounded-lg w-1/3"></div>
              <div className="h-28 bg-slate-200 rounded-2xl"></div>
              <div className="h-40 bg-slate-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Listing Unavailable</h2>
        <p className="text-slate-500 text-sm">{error || 'This listing could not be found.'}</p>
        <div className="pt-4">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            ← Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const isSold = listing.status === 'Sold' || listing.status === 'SOLD';
  const isAvailable = listing.status === 'Available' || listing.status === 'AVAILABLE';
  const isFree = Number(listing.price) === 0;
  const isSaved = checkIsSaved(listing._id);

  // Check if the currently logged-in user is the owner of the listing
  const currentUserId = user?._id || user?.id;
  const sellerId =
    listing.creatorId?._id ||
    listing.creatorId ||
    listing.seller?._id ||
    listing.seller;
  const isOwner = Boolean(
    currentUserId && sellerId && String(currentUserId) === String(sellerId)
  );

  const sellerName = listing.seller?.name || 'RJIT Student';
  const sellerCollege = listing.seller?.college || 'RJIT Tekanpur';
  const sellerEmail = listing.seller?.email || 'N/A';
  const sellerPhone = listing.seller?.phone || '';

  // Handler: Mark as Sold
  const handleMarkAsSold = async () => {
    try {
      setUpdatingStatus(true);
      setStatusMessage('');
      const res = await API.patch(`/listings/${id}/sell`);
      if (res.data?.success) {
        setListing((prev) => ({
          ...prev,
          status: 'Sold',
        }));
        setStatusMessage('Item marked as Sold successfully!');
      }
    } catch (err) {
      setStatusMessage(
        err.response?.data?.message || 'Failed to mark as sold. Please try again.'
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getWhatsAppLink = () => {
    if (!sellerPhone) return '';
    const cleanDigits = sellerPhone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
    const message = encodeURIComponent(
      `Hi, I am interested in your listing "${listing.title}" on ReuseCampus RJIT!`
    );
    return `https://wa.me/${phoneWithCountry}?text=${message}`;
  };

  const getEmailLink = () => {
    const subject = encodeURIComponent(`ReuseCampus RJIT: Inquiring about ${listing.title}`);
    const body = encodeURIComponent(
      `Hi ${sellerName},\n\nI saw your listing for "${listing.title}" (${
        isFree ? 'FREE / DONATION' : `₹${listing.price}`
      }) on ReuseCampus and would like to buy it.\n\nPlease let me know when and where on campus we can meet.\n\nThank you!`
    );
    return `mailto:${sellerEmail}?subject=${subject}&body=${body}`;
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const priceText = isFree ? 'FREE' : `₹${listing.price}`;
    const shareData = {
      title: listing.title,
      text: `${listing.title} - ${priceText} on ReuseCampus RJIT`,
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
      // fallback
    }
  };

  const copySellerDetails = () => {
    const formatted = `Seller: ${sellerName}\nCollege: ${sellerCollege}\nEmail: ${sellerEmail}\nPhone: ${
      sellerPhone || 'N/A'
    }\nItem: ${listing.title} (${isFree ? 'FREE' : `₹${listing.price}`})`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(formatted).catch(() => {});
    }
    setCopiedContact(true);
    setTimeout(() => setCopiedContact(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <button
          id="back-button"
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-emerald-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-full px-4 py-2 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Marketplace</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Native Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 shadow-sm text-xs font-bold transition-all active:scale-95 cursor-pointer"
            title="Share this listing"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Share</span>
          </button>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={() => toggleSaveItem(listing._id)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border shadow-sm text-xs font-bold transition-all active:scale-95 cursor-pointer ${
              isSaved
                ? 'bg-red-50 text-red-600 border-red-200'
                : 'bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 border-slate-200'
            }`}
            title={isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isSaved ? 'fill-red-500 text-red-500 scale-110' : ''
              }`}
            />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Share Toast */}
      {shareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold rounded-2xl shadow-2xl border border-emerald-500/30 animate-fadeIn pointer-events-none">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Listing link copied to clipboard!</span>
        </div>
      )}

      {/* Status Action Alert Notification */}
      {statusMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage('')}
            className="text-xs text-emerald-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Listing Layout: 2 Columns */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Product Photo Container */}
        <div className="lg:col-span-6 bg-slate-50 p-6 sm:p-10 flex flex-col items-center justify-center relative border-b lg:border-b-0 lg:border-r border-slate-200/90 min-h-[340px] sm:min-h-[460px]">
          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10 max-w-[85%]">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-slate-800 shadow-sm border border-slate-200/80 flex items-center gap-1">
              <Tag className="w-3 h-3 text-emerald-600" />
              {listing.category}
            </span>
            {isFree && (
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md border border-emerald-400/40">
                🎁 FREE DONATION
              </span>
            )}
            {/* Prominent SOLD badge or Status */}
            {isSold ? (
              <span
                id="sold-badge-pill"
                className="px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-amber-500 text-slate-950 shadow-md border border-amber-300"
              >
                SOLD
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-slate-900 text-white shadow-sm">
                AVAILABLE
              </span>
            )}
          </div>

          {/* Item Photo with Sold Dimming / Greying */}
          <div className="w-full h-full flex items-center justify-center relative my-auto">
            <img
              id="listing-detail-photo"
              src={listing.imageUrl}
              alt={listing.title}
              className={`max-h-[380px] sm:max-h-[440px] w-full object-contain rounded-2xl drop-shadow-md transition-all duration-300 ${
                isSold ? 'grayscale-[35%] opacity-80' : 'hover:scale-[1.02]'
              }`}
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />

            {/* Prominent SOLD Badge Overlay on Dimmed Photo */}
            {isSold && (
              <div
                id="photo-sold-overlay"
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center rounded-2xl pointer-events-none"
              >
                <div className="px-6 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-lg tracking-widest uppercase shadow-2xl border-2 border-amber-300 animate-pulse">
                  SOLD
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Listing Details, View Counter & Contact/Owner Actions */}
        <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Condition Pill & Timestamp */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  Condition: {listing.condition}
                </span>
                {isOwner && (
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Your Listing
                  </span>
                )}
              </div>

              <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Clock className="w-3.5 h-3.5" />
                {new Date(listing.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Listing Title */}
            <h1
              id="listing-detail-title"
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight"
            >
              {listing.title}
            </h1>

            {/* Price & Product View Counter Area */}
            <div className="flex items-center justify-between flex-wrap gap-4 pt-1 pb-2 border-b border-slate-100">
              {/* Pricing Display */}
              <div className="flex items-baseline gap-2">
                {isFree ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-800 font-black text-lg sm:text-xl border border-emerald-300 shadow-sm">
                    🎁 FREE FOR JUNIORS
                  </span>
                ) : (
                  <div className="flex items-baseline gap-1.5">
                    <span
                      id="listing-detail-price"
                      className="font-mono text-3xl sm:text-4xl font-extrabold text-slate-900"
                    >
                      ₹{listing.price.toLocaleString()}
                    </span>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Campus Deal
                    </span>
                  </div>
                )}
              </div>

              {/* View Counter Display (Near title/price) */}
              <div
                id="listing-view-counter"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-sm text-xs sm:text-sm font-bold"
                title="Total views recorded for this product"
              >
                <Eye className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>👁️ {listing.views ?? 0} Views</span>
              </div>
            </div>

            {/* Prominent SOLD Banner if status === 'Sold' */}
            {isSold && (
              <div
                id="prominent-sold-banner"
                className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-sm flex items-center justify-between shadow-md border border-amber-300 tracking-wide"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-950 text-amber-400 text-xs font-black tracking-widest uppercase">
                    SOLD
                  </span>
                  <span>This item has been marked as SOLD.</span>
                </div>
                <span className="text-xs uppercase tracking-wider opacity-90 hidden sm:inline">
                  Deal Closed
                </span>
              </div>
            )}

            {/* Owner "Mark as Sold" Control */}
            {isOwner && isAvailable && (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Seller Ownership Actions
                  </span>
                  <span className="text-[11px] font-semibold text-amber-700">
                    Item is currently Available
                  </span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Have you agreed to a deal with a fellow student? Mark this listing as Sold to
                  close outreach and prevent further inquiries.
                </p>
                <div className="pt-1 flex flex-wrap gap-2.5">
                  <button
                    id="mark-as-sold-btn"
                    type="button"
                    onClick={handleMarkAsSold}
                    disabled={updatingStatus}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-60"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{updatingStatus ? 'Updating...' : 'Mark as Sold'}</span>
                  </button>

                  <Link
                    to="/my-listings"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors shadow-sm"
                  >
                    Manage My Listings
                  </Link>
                </div>
              </div>
            )}

            {/* Description Section */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Item Description
              </h3>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 max-h-48 overflow-y-auto">
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {listing.description}
                </p>
              </div>
            </div>

            {/* Verified Campus Seller Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Campus Student Seller
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  RJIT Student ID Verified
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                  {sellerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{sellerName}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{sellerCollege}</span>
                  </p>
                </div>
              </div>

              {/* Contact information (Visible only when available or owner) */}
              {!isSold && (
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
              )}
            </div>
          </div>

          {/* Action / Contact Buttons Section */}
          <div className="space-y-3 pt-2">
            {isSold ? (
              /* CRITICAL REQUIREMENT: If listing.status === 'Sold', completely hide
                 "Direct WhatsApp Deal" and Email contact buttons to prevent further outreach */
              <div
                id="sold-outreach-disabled-box"
                className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 space-y-2"
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Item Sold Out</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  This item has already been marked as <strong>SOLD</strong>. Direct WhatsApp and
                  Email contact buttons are closed to prevent further inquiries.
                </p>
                <button
                  type="button"
                  disabled
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 font-bold text-xs cursor-not-allowed select-none"
                >
                  <MessageCircle className="w-4 h-4 text-slate-400" />
                  Outreach Disabled (Item Sold)
                </button>
              </div>
            ) : isOwner ? (
              <div className="space-y-2">
                <Link
                  to="/my-listings"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <span>Manage in My Listings</span>
                </Link>
                <button
                  type="button"
                  onClick={copySellerDetails}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedContact ? 'Copied to Clipboard!' : 'Copy Listing Details'}
                </button>
              </div>
            ) : (
              /* If available and not owner: Render Direct WhatsApp Deal and Email Contact */
              <div id="contact-action-buttons" className="space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sellerPhone ? (
                    <a
                      id="direct-whatsapp-deal-btn"
                      href={getWhatsAppLink()}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition-all active:scale-95 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Direct WhatsApp Deal</span>
                    </a>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-100 text-slate-400 font-medium text-xs">
                      <Phone className="w-4 h-4" />
                      <span>WhatsApp Not Provided</span>
                    </div>
                  )}

                  <a
                    id="email-contact-btn"
                    href={getEmailLink()}
                    className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-slate-900/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email Seller</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={copySellerDetails}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedContact ? 'Contact Info Copied!' : 'Copy Seller Contact Info'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;
