"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import { useAuthStore } from "@/store/authStore";

export default function ForgotPasswordPage() {
  const { requestMagicLink, loading, error } = useAuthStore();
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await requestMagicLink(email);
    if (res.success) {
      setSuccess(true);
      setMessage(
        res.message || "Một liên kết đăng nhập đã được gửi đến email của bạn.",
      );
    }
  };

  return (
    <AuthSplitLayout
      reverse={false}
      bannerImage="https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop"
      bannerTitle="Quên mật khẩu?"
      bannerSubtitle="Đừng lo lắng, chúng tôi sẽ giúp bạn đăng nhập lại một cách nhanh chóng và an toàn không cần mật khẩu."
    >
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white mb-3 tracking-tight">
          Magic Link
        </h1>
        <p className="text-gray-400">
          Nhập email của bạn để nhận liên kết đăng nhập trực tiếp.
        </p>
      </div>

      {success ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col items-center justify-center p-8 bg-green-500/10 border border-green-500/30 rounded-2xl text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              Đã gửi thành công!
            </h3>
            <p className="text-gray-400 text-sm">{message}</p>
          </div>
          <Link
            href="/login"
            className="w-full bg-[#141414] border border-[#333] hover:border-primary text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      ) : (
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
                placeholder="Nhập email đã đăng ký"
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
            disabled={loading || !email}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_0_20px_rgba(229,9,20,0.3)] hover:shadow-[0_0_30px_rgba(229,9,20,0.5)] mt-4"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Gửi Magic Link{" "}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm font-bold text-gray-400 hover:text-white transition-colors"
            >
              Tôi nhớ mật khẩu rồi, quay lại đăng nhập
            </Link>
          </div>
        </form>
      )}
    </AuthSplitLayout>
  );
}
