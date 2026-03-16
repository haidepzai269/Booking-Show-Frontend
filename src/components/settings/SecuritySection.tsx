"use client";

import React from "react";
import { Lock, Smartphone, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function SecuritySection() {
  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Bảo mật tài khoản
        </h1>
        <p className="text-gray-400">Quản lý mật khẩu và các tùy chọn bảo mật để bảo vệ tài khoản của bạn.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Pass Change Card */}
        <div className="glass-card rounded-2xl p-6 flex items-center justify-between group hover:border-purple-500/30 transition-all cursor-pointer">
          <div className="flex items-center gap-6">
            <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
              <Lock size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Đổi mật khẩu</h3>
              <p className="text-sm text-gray-400">Nên sử dụng mật khẩu mạnh để tăng tính bảo mật.</p>
            </div>
          </div>
          <Link 
            href="/reset-password"
            className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all text-sm font-bold"
          >
            Thay đổi
          </Link>
        </div>

        {/* 2FA Card */}
        <div className="glass-card rounded-2xl p-6 flex items-center justify-between group hover:border-blue-500/30 transition-all cursor-pointer">
          <div className="flex items-center gap-6">
            <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
              <Smartphone size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Xác thực 2 yếu tố (2FA)</h3>
              <p className="text-sm text-gray-400">Xác nhận qua số điện thoại hoặc email khi đăng nhập.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-xs font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-full">Chưa bật</span>
             <button className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all">
               Thiết lập
             </button>
          </div>
        </div>

        {/* Login Activity */}
        <div className="glass-card rounded-2xl p-6 flex items-center justify-between group hover:border-green-500/30 transition-all cursor-pointer">
          <div className="flex items-center gap-6">
            <div className="p-4 rounded-2xl bg-green-500/10 text-green-500 group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Hoạt động đăng nhập</h3>
              <p className="text-sm text-gray-400">Kiểm tra danh sách các thiết bị đã đăng nhập vào tài khoản.</p>
            </div>
          </div>
          <button className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all">
            Xem ngay
          </button>
        </div>
      </div>
    </div>
  );
}
