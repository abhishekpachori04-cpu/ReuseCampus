import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  PlusCircle,
  Package,
  LogIn,
  UserPlus,
  LogOut,
  Menu,
  X,
  Home,
  User,
  ShieldCheck,
  Phone,
  Mail,
  Loader2,
  Check,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, updateProfile, isAuthenticated } = useAuth();

  // Profile modal edit fields
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Sync profile fields whenever modal opens or user updates
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
    }
  }, [user, isProfileOpen]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
    setIsProfileOpen(false);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      if (updateProfile) {
        await updateProfile({
          name: profileName.trim(),
          phone: profilePhone.trim(),
        });
      }
      setProfileSuccess('Campus profile updated successfully!');
      setTimeout(() => {
        setProfileSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setProfileError(
        err.response?.data?.message || err.message || 'Could not update profile. Please try again.'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Post Item', path: '/create', icon: PlusCircle, highlight: true },
    ...(isAuthenticated ? [{ name: 'My Listings', path: '/my-listings', icon: Package }] : []),
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group transition-transform active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/35 transition-all">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Reuse<span className="text-emerald-600">Campus</span>
                </span>
                <span className="text-[10px] tracking-wider font-semibold text-slate-400 uppercase -mt-1">
                  Student Marketplace
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      link.highlight
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 ml-2'
                        : isActive(link.path)
                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Auth Links */}
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-200">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  {/* Clickable Profile Chip to Open Profile Modal */}
                  <button
                    type="button"
                    onClick={() => {
                      setProfileError('');
                      setProfileSuccess('');
                      setIsProfileOpen(true);
                    }}
                    className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-100 hover:bg-emerald-50/80 rounded-xl transition-all cursor-pointer group text-left border border-slate-200/80 hover:border-emerald-300"
                    title="Click to view and edit your Campus Profile"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
                      {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors">
                        {user?.name || 'Campus Student'}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-medium leading-tight truncate max-w-[120px]">
                        {user?.college || user?.email}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={handleLogout}
                    type="button"
                    title="Sign Out"
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/login')
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
                aria-label="Toggle Navigation"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1 shadow-lg">
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setProfileError('');
                  setProfileSuccess('');
                  setIsProfileOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 mb-2 bg-slate-50 hover:bg-emerald-50 rounded-xl transition-colors text-left border border-slate-200/60 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-slate-800 leading-tight">
                    {user?.name}
                  </span>
                  <span className="text-xs text-emerald-700 font-medium leading-tight">
                    {user?.college || user?.email}
                  </span>
                </div>
              </button>
            )}

            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-base font-medium ${
                    link.highlight
                      ? 'bg-emerald-600 text-white'
                      : isActive(link.path)
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.name}
                </Link>
              );
            })}

            <div className="pt-3 mt-2 border-t border-slate-100">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out ({user?.name?.split(' ')[0]})
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100"
                  >
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Requirement 3: Sleek "My Campus Profile" Modal */}
      {isProfileOpen && (
        <div
          onClick={() => setIsProfileOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-6 relative text-left"
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setIsProfileOpen(false)}
              type="button"
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 uppercase tracking-wider border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified Student
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-2">My Campus Profile</h3>
              <p className="text-xs text-slate-500">
                Manage your student identity and contact information for peer trades.
              </p>
            </div>

            {/* Profile Avatar Card */}
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/70 rounded-2xl flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-600/20 shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-slate-900 text-base truncate">
                  {user?.name || 'Student'}
                </h4>
                <div className="flex items-center gap-1 text-xs text-emerald-800 font-semibold truncate mt-0.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{user?.college || 'RJIT Tekanpur'}</span>
                </div>
              </div>
            </div>

            {/* Success and Error Alerts */}
            {profileSuccess && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {/* Verified Institutional Email (Read-only) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Institutional Email
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> Verified
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    disabled
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-xs font-medium cursor-not-allowed select-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Locked to your college domain to safeguard student-only transactions.
                </p>
              </div>

              {/* College Name (Read-only) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  College / Campus
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={user?.college || 'Rustamji Institute of Technology (RJIT)'}
                    readOnly
                    disabled
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-xs font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Student Name (Editable) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* WhatsApp Contact Phone (Editable) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  WhatsApp Contact Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Campus buyers will use this number to message you on WhatsApp for handovers.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  {isUpdating ? (
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
    </>
  );
};

export default Navbar;
