"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import { apiClient } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await apiClient.post<
        any,
        { success: boolean; error?: string }
      >("/auth/register", {
        full_name: fullName,
        email: email,
        password: password,
        role: "USER",
      });

      if (res.success) {
        // Đăng ký thành công thì chuyển tới form Đăng nhập
        router.push("/login?registered=true");
      } else {
        setError(res.error || "Đăng ký thất bại, email có thể đã tồn tại.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "Đăng ký thất bại, vui lòng kiểm tra lại thông tin.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      reverse={true} // Banner bên trái, Form bên phải
      bannerImage="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2070&auto=format&fit=crop"
      bannerTitle="Khám Phá Thế Giới Phim Ảnh"
      bannerSubtitle="Tạo thẻ thành viên trực tuyến ngay hôm nay để nhận được hàng nghìn voucher ưu đãi và tham gia các sự kiện điện ảnh."
    >
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white mb-3 tracking-tight">
          Đăng Ký
        </h1>
        <p className="text-gray-400">
          Gia nhập cộng đồng người yêu điện ảnh lớn nhất.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-300">Họ và tên</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full bg-[#141414] border border-[#333] rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors font-medium shadow-inner"
            />
          </div>
        </div>

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
          <label className="text-sm font-bold text-gray-300">Mật khẩu</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
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
          disabled={loading || !email || !password || !fullName}
          className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_0_20px_rgba(229,9,20,0.3)] hover:shadow-[0_0_30px_rgba(229,9,20,0.5)] mt-6"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Tạo Tài Khoản Đi{" "}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-400 font-medium">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="text-primary hover:text-white font-bold transition-colors"
        >
          Đăng nhập ngay
        </Link>
      </div>
    </AuthSplitLayout>
  );
}
