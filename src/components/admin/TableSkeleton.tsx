"use client";

import React from "react";

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  className?: string;
}

/**
 * TableSkeleton - Hiệu ứng tải trang "xịn xò" cho bảng admin
 * Kết hợp giữa pulse và shimmer để tạo cảm giác cao cấp
 */
export default function TableSkeleton({
  rows = 5,
  cols = 5,
  className = "",
}: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr
          key={rowIndex}
          className={`animate-pulse border-b border-zinc-800/50 ${className}`}
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <td key={colIndex} className="px-6 py-5">
              <div className="relative overflow-hidden">
                {/* Thanh nội dung giả */}
                <div
                  className={`h-3.5 bg-zinc-800/60 rounded-full ${
                    colIndex === 0
                      ? "w-8"
                      : colIndex === 1
                      ? "w-3/4"
                      : "w-full"
                  }`}
                />
                
                {/* Hiệu ứng Shimmer (ánh sáng lướt qua) */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
              </div>
              
              {/* Thêm dòng phụ nhỏ cho cột thứ 2 (thường là tên/email) */}
              {colIndex === 1 && (
                <div className="mt-2 relative overflow-hidden">
                  <div className="h-2 bg-zinc-800/40 rounded-full w-1/2" />
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />
                </div>
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
