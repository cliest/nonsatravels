import React from 'react';

// Base skeleton animation class
const shimmer = "animate-pulse bg-gray-50 bg-[length:200%_100%]";

// Skeleton component for text
export const SkeletonText = ({ lines = 1, className = "" }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`h-4 ${shimmer} rounded ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
      />
    ))}
  </div>
);

// Skeleton component for images/avatars
export const SkeletonImage = ({ className = "w-full h-48" }) => (
  <div className={`${shimmer} rounded-lg ${className}`} />
);

// Skeleton for hotel cards
export const SkeletonHotelCard = () => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
    <SkeletonImage className="w-full h-48" />
    <div className="p-4 space-y-3">
      <div className="flex justify-between items-start">
        <SkeletonText className="w-2/3" />
        <div className={`w-12 h-6 ${shimmer} rounded`} />
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-4 h-4 ${shimmer} rounded`} />
        <SkeletonText className="w-1/2" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <SkeletonText className="w-1/3" />
        <div className={`w-24 h-10 ${shimmer} rounded-lg`} />
      </div>
    </div>
  </div>
);

// Skeleton for hotel grid
export const SkeletonHotelGrid = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonHotelCard key={i} />
    ))}
  </div>
);

// Skeleton for booking cards
export const SkeletonBookingCard = () => (
  <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
    <div className="flex gap-4">
      <SkeletonImage className="w-24 h-24 rounded-lg" />
      <div className="flex-1 space-y-2">
        <SkeletonText className="w-3/4" />
        <SkeletonText className="w-1/2" />
        <div className="flex gap-2">
          <div className={`w-20 h-6 ${shimmer} rounded-full`} />
        </div>
      </div>
    </div>
    <div className="flex justify-between items-center pt-2 border-t">
      <SkeletonText className="w-1/4" />
      <div className={`w-28 h-10 ${shimmer} rounded-lg`} />
    </div>
  </div>
);

// Skeleton for testimonial cards
export const SkeletonTestimonialCard = () => (
  <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
    <div className="flex items-center gap-3">
      <div className={`w-12 h-12 ${shimmer} rounded-full`} />
      <div className="space-y-2">
        <SkeletonText className="w-24" />
        <SkeletonText className="w-16" />
      </div>
    </div>
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`w-5 h-5 ${shimmer} rounded`} />
      ))}
    </div>
    <SkeletonText lines={3} />
  </div>
);

// Skeleton for offer cards
export const SkeletonOfferCard = () => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
    <SkeletonImage className="w-full h-40" />
    <div className="p-4 space-y-3">
      <div className="flex justify-between">
        <SkeletonText className="w-2/3" />
        <div className={`w-16 h-6 ${shimmer} rounded-full`} />
      </div>
      <SkeletonText lines={2} />
      <div className="flex justify-between items-center">
        <SkeletonText className="w-1/3" />
        <div className={`w-24 h-10 ${shimmer} rounded-lg`} />
      </div>
    </div>
  </div>
);

// Skeleton for stats dashboard
export const SkeletonStatCard = () => (
  <div className="bg-white rounded-xl shadow-md p-6 space-y-3">
    <div className="flex justify-between items-center">
      <div className={`w-12 h-12 ${shimmer} rounded-lg`} />
      <div className={`w-16 h-6 ${shimmer} rounded-full`} />
    </div>
    <SkeletonText className="w-1/2" />
    <div className={`h-8 ${shimmer} rounded w-1/3`} />
  </div>
);

// Skeleton for table rows
export const SkeletonTableRow = ({ columns = 5 }) => (
  <tr className="border-b">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="py-4 px-4">
        <div className={`h-4 ${shimmer} rounded w-full`} />
      </td>
    ))}
  </tr>
);

// Skeleton for table
export const SkeletonTable = ({ rows = 5, columns = 5 }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i} className="py-3 px-4">
              <div className={`h-4 ${shimmer} rounded w-3/4`} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonTableRow key={i} columns={columns} />
        ))}
      </tbody>
    </table>
  </div>
);

// Skeleton for profile/user card
export const SkeletonProfile = () => (
  <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
    <div className="flex items-center gap-6">
      <div className={`w-24 h-24 ${shimmer} rounded-full`} />
      <div className="space-y-2">
        <SkeletonText className="w-48" />
        <SkeletonText className="w-32" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonText className="w-1/3" />
          <div className={`h-10 ${shimmer} rounded-lg w-full`} />
        </div>
      ))}
    </div>
  </div>
);

// Skeleton for detailed view/page
export const SkeletonDetailPage = () => (
  <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 ${shimmer} rounded-full`} />
      <SkeletonText className="w-48" />
    </div>
    <SkeletonImage className="w-full h-96 rounded-2xl" />
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <SkeletonText className="w-3/4" />
        <SkeletonText lines={4} />
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`w-20 h-8 ${shimmer} rounded-full`} />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className={`h-64 ${shimmer} rounded-xl`} />
      </div>
    </div>
  </div>
);

export default {
  SkeletonText,
  SkeletonImage,
  SkeletonHotelCard,
  SkeletonHotelGrid,
  SkeletonBookingCard,
  SkeletonTestimonialCard,
  SkeletonOfferCard,
  SkeletonStatCard,
  SkeletonTableRow,
  SkeletonTable,
  SkeletonProfile,
  SkeletonDetailPage,
};
