"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import { useAuthStore } from "@/store/authStore";
import OAuthButtons from "@/components/auth/OAuthButtons";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { ApiResponse } from "@/types/api";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, setAuth, loading, error } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Xử lý login bằng token từ OAuth callback
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // Gọi API lấy thông tin user me để hoàn tất login
      apiClient.get<{ success: boolean; data: {
        id: number;
        email: string;
        full_name?: string;
        fullName?: string;
        role: string;
        theme?: string;
        language?: string;
        rank?: string;
        total_spending?: number;
      } }>("/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      }).then((res) => {
        const responseData = res as unknown as ApiResponse<any>;
        if (responseData.success && responseData.data) {
          const rawUser = responseData.data;
          const user = {
            id: rawUser.id,
            email: rawUser.email,
            fullName: rawUser.full_name || rawUser.fullName || "",
            role: rawUser.role,
            theme: rawUser.theme || 'dark',
            language: rawUser.language || 'vi',
            rank: rawUser.rank || 'BRONZE',
            totalSpending: rawUser.total_spending || 0,
          };
          setAuth(token, user);
          router.push("/");
        }
      }).catch(err => {
        console.error("OAuth login failed", err);
      });
    }
  }, [searchParams, setAuth, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      router.push("/");
    }
  };

  return (
    <AuthSplitLayout
      reverse={false} // Form bên trái, Banner bên phải
      bannerImage="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop"
      bannerTitle="Trải nghiệm điện ảnh đỉnh cao"
      bannerSubtitle="Đăng nhập để đặt vé ngay, trải nghiệm rạp chiếu chuẩn quốc tế cùng hàng ngàn ưu đãi hấp dẫn."
    >
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white mb-3 tracking-tight">
          Đăng Nhập
        </h1>
        <p className="text-gray-400">
          Chào mừng bạn quay lại hệ thống BookingShow.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-300">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              className="w-full bg-[#141414] border border-[#333] rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors font-medium shadow-inner"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-gray-300">Mật khẩu</label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-primary hover:text-white transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="w-full bg-[#141414] border border-[#333] rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors font-medium shadow-inner"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm font-medium mt-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_0_20px_rgba(229,9,20,0.3)] hover:shadow-[0_0_30px_rgba(229,9,20,0.5)] mt-4"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Đăng Nhập{" "}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <OAuthButtons />

      <div className="mt-8 text-center text-sm text-gray-400 font-medium">
        Chưa có tài khoản?{" "}
        <Link
          href="/register"
          className="text-primary hover:text-white font-bold transition-colors"
        >
          Đăng ký ngay
        </Link>
      </div>
    </AuthSplitLayout>
  );
}
