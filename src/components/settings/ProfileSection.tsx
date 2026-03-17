"use client";

import React from "react";
import NextImage from "next/image";
import { Camera, Edit2 } from "lucide-react";

interface ProfileSectionProps {
  user: {
    id: number;
    full_name: string;
    email: string;
    phone: string;
  };
  onUpdate: (data: { full_name: string; phone: string }) => Promise<void>;
  isSaving: boolean;
}

export default function ProfileSection({ user, onUpdate, isSaving }: ProfileSectionProps) {
  const [form, setForm] = React.useState({
    full_name: user.full_name,
    phone: user.phone || "",
    gender: "male", // Fallback if not in schema
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ full_name: form.full_name, phone: form.phone });
  };

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Thông tin cá nhân
        </h1>
        <p className="text-gray-400">Cập nhật thông tin cá nhân và cài đặt tài khoản của bạn.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-12 items-start">
        {/* Avatar Section */}
        <div className="relative group">
          <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 p-1">
            <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center overflow-hidden border-4 border-[#0f172a]">
              <NextImage 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" 
                alt="Avatar" 
                width={160}
                height={160}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <button className="absolute bottom-2 right-2 p-3 bg-purple-600 rounded-full text-white shadow-xl hover:bg-purple-500 transition-all transform group-hover:scale-110 active:scale-95 border-4 border-[#0f172a]">
            <Camera size={20} />
          </button>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-400 px-1">Tên hiển thị</label>
            <div className="relative group">
              <input 
                type="text" 
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
              <Edit2 size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-400 px-1">Email</label>
            <input 
              type="email" 
              value={user.email}
              disabled
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-gray-500 transition-all cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-400 px-1">Số điện thoại</label>
            <input 
              type="text" 
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-400 px-1">Giới tính</label>
            <select 
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500 transition-all appearance-none cursor-pointer"
            >
              <option value="male" className="bg-[#0f172a]">Nam</option>
              <option value="female" className="bg-[#0f172a]">Nữ</option>
              <option value="other" className="bg-[#0f172a]">Khác</option>
            </select>
          </div>
          
          <div className="md:col-span-2 pt-4">
            <button 
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-4 px-10 rounded-2xl hover:opacity-90 transition-all transform hover:-translate-y-1 active:scale-95 shadow-lg shadow-purple-500/20 disabled:opacity-50"
            >
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
