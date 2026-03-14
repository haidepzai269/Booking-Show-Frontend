import React from 'react';

export default function MoviesLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="h-[40vh] w-full bg-card/50 animate-pulse"></div>
      <div className="max-w-7xl mx-auto w-full px-6 py-10 flex gap-8">
        <aside className="hidden lg:block w-64 space-y-6">
          <div className="h-10 bg-card rounded-xl animate-pulse"></div>
          <div className="h-40 bg-card rounded-xl animate-pulse"></div>
          <div className="h-40 bg-card rounded-xl animate-pulse"></div>
        </aside>
        <main className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 w-48 bg-card rounded-lg animate-pulse"></div>
            <div className="h-8 w-32 bg-card rounded-lg animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-card rounded-2xl animate-pulse border border-white/5"></div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
