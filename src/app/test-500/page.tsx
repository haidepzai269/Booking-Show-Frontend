"use client";

import { useEffect } from "react";

export default function Test500Page() {
  useEffect(() => {
    // Thăng chức lỗi để Next.js Error Boundary bắt được
    throw new Error("Đây là lỗi thử nghiệm để kiểm tra trang 500!");
  }, []);

  return (
    <div className="p-20 text-center">
      <h1 className="text-2xl font-bold">Đang chuẩn bị gây lỗi...</h1>
      <p className="text-gray-500">Trang này sẽ tự động báo lỗi sau khi load xong.</p>
    </div>
  );
}
