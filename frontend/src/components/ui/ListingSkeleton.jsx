import React from 'react';

/**
 * Skeleton card component mirroring the exact geometry and layout of ListingCard
 */
const ListingSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col animate-pulse">
      {/* Image Skeleton */}
      <div className="relative h-48 w-full bg-slate-200">
        {/* Floating Category Badge Skeleton */}
        <div className="absolute top-2.5 left-2.5 w-16 h-5 rounded-full bg-slate-300" />
        {/* Floating Status Badge Skeleton */}
        <div className="absolute top-2.5 right-2.5 w-20 h-5 rounded-full bg-slate-300" />
      </div>

      {/* Details Skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Condition and Date Row */}
          <div className="flex items-center justify-between">
            <div className="w-14 h-4 rounded bg-slate-200" />
            <div className="w-16 h-3.5 rounded bg-slate-200" />
          </div>

          {/* Title Line */}
          <div className="h-5 w-4/5 rounded-md bg-slate-200 mt-1" />

          {/* Description Lines */}
          <div className="space-y-1.5 pt-1">
            <div className="h-3 w-full rounded bg-slate-100" />
            <div className="h-3 w-2/3 rounded bg-slate-100" />
          </div>
        </div>

        {/* Pricing & Footer Actions */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="h-6 w-20 rounded bg-slate-200" />
            <div className="h-7 w-24 rounded-xl bg-slate-200" />
          </div>

          {/* Seller College Line */}
          <div className="flex items-center gap-2 pt-0.5">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-200 shrink-0" />
            <div className="h-3 w-1/2 rounded bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingSkeleton;
