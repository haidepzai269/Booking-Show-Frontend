import React from 'react';

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6">
      <div className="w-16 h-16 border-4 border-white/5 border-t-primary rounded-full animate-spin mb-4"></div>
      <div className="max-w-md w-full space-y-4">
        <div className="h-8 bg-white/5 rounded-lg animate-pulse w-3/4 mx-auto"></div>
        <div className="h-32 bg-white/5 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-white/5 rounded-xl animate-pulse"></div>
          <div className="h-20 bg-white/5 rounded-xl animate-pulse"></div>
        </div>
      </div>
      <p className="text-white/40 text-sm mt-8 animate-pulse">Đang tải hồ sơ bảo mật...</p>
    </div>
  );
}
