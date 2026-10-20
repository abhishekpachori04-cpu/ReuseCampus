import { Search, X, ArrowUpDown } from 'lucide-react';
import {
  CATEGORY_FILTERS,
  CONDITION_FILTERS,
  STATUS_OPTIONS,
  SORT_OPTIONS,
} from '../../constants/campusConstants';

/**
 * Filter and search toolbar for marketplace listings
 */
const ListingFilterBar = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedCondition,
  onConditionChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Search Input Bar */}
      <div className="relative flex items-center bg-white rounded-2xl shadow-sm border border-slate-200 p-2 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all">
        <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search textbooks, lab coats, calculators, cycles, hostel furniture..."
          className="w-full px-3 py-2 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-sm sm:text-base"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search query"
            className="p-1.5 mr-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Toolbar: Status, Condition, and Sort By */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Segment */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status:</span>
            <div className="flex flex-wrap gap-1">
              {STATUS_OPTIONS.map((st) => (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => onStatusChange(st.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedStatus === st.value
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Condition Segment */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Condition:</span>
            <div className="flex flex-wrap gap-1">
              {CONDITION_FILTERS.map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => onConditionChange(cond)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    selectedCondition === cond
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <label htmlFor="sort-select" className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            Sort By:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer shadow-sm"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
        {CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoryChange(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ListingFilterBar;
