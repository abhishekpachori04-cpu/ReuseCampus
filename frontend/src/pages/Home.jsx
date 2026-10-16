import React from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Laptop,
  Armchair,
  Bike,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Coins,
  RefreshCw,
} from 'lucide-react';

const categories = [
  { name: 'Textbooks & Notes', icon: BookOpen, count: '140+ items' },
  { name: 'Electronics & Gadgets', icon: Laptop, count: '85+ items' },
  { name: 'Dorm Essentials', icon: Armchair, count: '60+ items' },
  { name: 'Cycles & Vehicles', icon: Bike, count: '30+ items' },
];

const Home = () => {
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 pt-16 pb-20 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Verified Campus-Only Second Hand Community
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Buy, Sell & Pass Down Items <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Right On Your Campus
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-slate-600 leading-relaxed">
            ReuseCampus connects students to trade textbooks, gadgets, hostel furniture,
            and gear safely within your verified college community. Save money and cut waste!
          </p>

          {/* Search Bar Placeholder */}
          <div className="max-w-2xl mx-auto mt-6">
            <div className="relative flex items-center bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 p-2 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                placeholder="Search calculus books, mini fridge, scientific calculator, cycles..."
                className="w-full px-3 py-2.5 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-sm sm:text-base"
              />
              <button
                type="button"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 active:scale-95 shrink-0"
              >
                Search
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-lg shadow-emerald-600/25 transition-all"
            >
              List an Item for Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 shadow-sm transition-all"
            >
              Browse Campus Listings
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Popular Categories</h2>
            <p className="text-sm text-slate-500">Find essentials curated for university life</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                className="group p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-800 text-base group-hover:text-emerald-700">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{cat.count}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800">Verified College Students</h3>
            <p className="text-sm text-slate-600">
              Only users with official .edu or .ac institutional domains can register and trade.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800">Zero Middleman Commissions</h3>
            <p className="text-sm text-slate-600">
              Direct peer-to-peer exchange. Pay and receive 100% of the agreed price instantly.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800">Sustainable Campus Living</h3>
            <p className="text-sm text-slate-600">
              Reduce campus waste by passing down textbooks, furniture, and gadgets to juniors.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
