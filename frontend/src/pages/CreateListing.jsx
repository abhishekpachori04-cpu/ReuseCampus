import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  PlusCircle,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  Sparkles,
  UploadCloud,
  Camera,
  X,
  Link as LinkIcon,
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

import { CATEGORIES, CONDITIONS } from '../constants/campusConstants';
import { compressImageFile } from '../utils/imageCompressor';

// Preset sample images for quick testing
const imagePresets = [
  {
    name: 'Textbook',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Calculator',
    url: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48f?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Lab Coat',
    url: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Study Lamp',
    url: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Desk Chair',
    url: 'https://images.unsplash.com/photo-1580481077195-c3a82da91609?auto=format&fit=crop&w=600&q=80',
  },
];

const CreateListing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Books',
    condition: 'Good',
    imageUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [imageFileName, setImageFileName] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage('');
  };

  // Device file upload handler
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    setErrorMessage('');

    try {
      const compressedDataUrl = await compressImageFile(file, 900, 0.8);
      setFormData((prev) => ({ ...prev, imageUrl: compressedDataUrl }));
      setImageFileName(file.name);
    } catch (err) {
      console.error('Image compression error:', err);
      setErrorMessage(err.message || 'Failed to process selected image.');
    } finally {
      setCompressing(false);
    }
  };

  const handleSelectPreset = (url, name) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }));
    setImageFileName(`${name} Preset Photo`);
    if (errorMessage) setErrorMessage('');
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    setImageFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isAuthenticated) {
      setErrorMessage('You must be signed in with your college account to publish a listing.');
      return;
    }

    if (!formData.imageUrl) {
      setErrorMessage('Please upload a photo of your item or select a sample image.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: formData.category,
        condition: formData.condition,
        imageUrl: formData.imageUrl.trim(),
      };

      const res = await API.post('/listings', payload);

      if (res.data?.success) {
        setSuccessMessage('Listing published successfully! Redirecting...');
        setTimeout(() => {
          navigate('/my-listings');
        }, 1200);
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to create listing. Please check your inputs.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-slate-200/50 space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <PlusCircle className="w-3.5 h-3.5" />
            Sell or Donate to Students
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Create a New Campus Listing
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Fill out the details below so students on your campus can find and buy your item.
          </p>
        </div>

        {!isAuthenticated && (
          <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm">
            <div className="flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-amber-600 shrink-0" />
              <span>You must be signed in to publish items.</span>
            </div>
            <Link
              to="/login"
              state={{ from: { pathname: '/create' } }}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs transition-colors shrink-0"
            >
              Sign In First
            </Link>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Item Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Thomas Calculus 14th Edition with Solution Manual"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>

          {/* Category & Condition Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Condition *
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price (with IndianRupee ₹ icon) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Price (₹) *
            </label>
            <div className="relative">
              <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0 (Set 0 for free giveaway)"
                min="0"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Item Photo Upload Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Item Photo *
              </label>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <LinkIcon className="w-3 h-3" />
                {showUrlInput ? 'Hide URL paste' : 'Or paste image URL'}
              </button>
            </div>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="device-photo-input"
            />

            {/* Photo Selection Card */}
            {!formData.imageUrl ? (
              <label
                htmlFor="device-photo-input"
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/40 rounded-2xl cursor-pointer transition-all group text-center space-y-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {compressing ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <UploadCloud className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {compressing ? 'Optimizing photo...' : 'Upload Item Photo from Device'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click to browse or take photo (PNG, JPG, WEBP auto-compressed)
                  </p>
                </div>
              </label>
            ) : (
              /* Live Preview Card */
              <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-100">
                <div className="relative h-56 w-full">
                  <img
                    src={formData.imageUrl}
                    alt="Item Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />

                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-semibold bg-white/90 hover:bg-white text-slate-800 rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-600" />
                      Change Photo
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
                      title="Remove Photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-3 text-white">
                    <span className="text-xs font-medium bg-slate-900/70 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                      {imageFileName || 'Item Photo Ready'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Optional URL input fallback */}
            {showUrlInput && (
              <div className="pt-2 animate-fadeIn">
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs"
                />
              </div>
            )}

            {/* Quick Image Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-500" /> Or pick a sample campus photo:
              </span>
              <div className="flex flex-wrap gap-2">
                {imagePresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url, preset.name)}
                    className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Item Description *
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what condition the item is in, any markings, reason for selling, and where you can meet on campus (e.g. Student Union or Library)..."
              required
              className="w-full p-4 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !isAuthenticated}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-600/25 transition-all active:scale-95 text-base cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Publishing Listing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Publish Listing
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;


