"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Loader2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import { useAuthStore } from "@/store/authStore";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { resetPassword, loading, error } = useAuthStore();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!token) {
      setValidationError("Token không hợp lệ hoặc đã hết hạn.");
      return;
    }

    if (password.length < 6) {
      setValidationError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Mật khẩu xác nhận không khớp.");
      return;
    }

    const res = await resetPassword(token, password);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
  };

  return (
    <AuthSplitLayout
      reverse={false}
      bannerImage="https://images.unsplash.com/photo-1633265485768-30691b12abe1?q=80&w=2070&auto=format&fit=crop"
      bannerTitle="Bảo mật tài khoản"
      bannerSubtitle="Thiết lập mật khẩu mới mạnh mẽ hơn để bảo vệ thông tin cá nhân của bạn."
    >
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white mb-3 tracking-tight">
          Đặt Lại Mật Khẩu
        </h1>
        <p className="text-gray-400">
          Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
        </p>
      </div>

      {!token ? (
        <div className="p-8 bg-red-500/10 border border-red-500/30 rounded-2xl text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4 mx-auto" />
          <h3 className="text-xl font-bold text-white mb-2">
            Liên kết không hợp lệ
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Liên kết này đã hết hạn hoặc không tồn tại. Vui lòng yêu cầu một
            liên kết mới.
          </p>
          <button
            onClick={() => router.push("/forgot-password")}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-all"
          >
            Yêu cầu lại Magic Link
          </button>
        </div>
      ) : success ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col items-center justify-center p-8 bg-green-500/10 border border-green-500/30 rounded-2xl text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Thành công!</h3>
            <p className="text-gray-400 text-sm">
              Mật khẩu của bạn đã được cập nhật. Đang quay lại trang đăng
              nhập...
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-300">
              Mật khẩu mới
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập ít nhất 6 ký tự"
                className="w-full bg-[#141414] border border-[#333] rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors font-medium shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-300">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full bg-[#141414] border border-[#333] rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors font-medium shadow-inner"
              />
            </div>
          </div>

          {(error || validationError) && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm font-medium mt-2">
              {error || validationError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password || !confirmPassword}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_0_20px_rgba(229,9,20,0.3)] hover:shadow-[0_0_30px_rgba(229,9,20,0.5)] mt-4"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Cập nhật mật khẩu{" "}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      )}
    </AuthSplitLayout>
  );
}
