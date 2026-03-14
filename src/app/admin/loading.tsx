import React from 'react';

export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div className="text-center">
        <p className="text-white/60 text-sm font-medium animate-pulse">
          Đang tải dữ liệu quản trị...
        </p>
      </div>
    </div>
  );
}
