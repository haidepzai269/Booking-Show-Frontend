"use client";

import React from "react";
import { CreditCard, Plus, HelpCircle } from "lucide-react";

export default function PaymentsSection() {
  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Phương thức thanh toán
        </h1>
        <p className="text-gray-400">Quản lý thẻ tín dụng và các ví điện tử được liên kết.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Mockup */}
        <div className="h-56 bg-gradient-to-br from-purple-700 via-purple-600 to-pink-600 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          {/* Subtle patterns */}
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:bg-white/20 transition-all duration-700" />
          
          <div className="flex justify-between items-start">
            <CreditCard size={40} className="text-white/80" />
            <div className="text-white font-bold italic text-2xl">VISA</div>
          </div>
          
          <div className="text-2xl font-mono text-white tracking-[0.25em] py-2">
            **** **** **** 4242
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <div className="text-[10px] text-white/60 uppercase tracking-widest mb-1">Chủ thẻ</div>
              <div className="text-sm font-bold text-white uppercase tracking-wider">ADMIN USER</div>
            </div>
            <div>
              <div className="text-[10px] text-white/60 uppercase tracking-widest mb-1">Hết hạn</div>
              <div className="text-sm font-bold text-white uppercase tracking-wider">08/29</div>
            </div>
          </div>
        </div>

        {/* Add New Card */}
        <button className="h-56 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-purple-500/50 hover:bg-white/5 transition-all group group-hover:translate-y-[-4px]">
          <div className="p-5 rounded-full bg-white/5 group-hover:bg-purple-500 group-hover:text-white transition-all">
            <Plus size={32} className="text-gray-400 group-hover:text-white" />
          </div>
          <span className="text-gray-400 font-bold group-hover:text-white transition-colors">Thêm thẻ mới</span>
        </button>
      </div>

      {/* Info Message */}
      <div className="flex items-start gap-4 p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-200">
        <HelpCircle size={20} className="mt-1 flex-shrink-0" />
        <div className="text-sm leading-relaxed">
          Chúng tôi sử dụng tiêu chuẩn bảo mật PCI-DSS để bảo vệ thông tin của bạn. Các thông tin nhạy cảm được mã hóa hoàn toàn và không lưu trữ trên máy chủ của chúng tôi.
        </div>
      </div>
    </div>
  );
}
