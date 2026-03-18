"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Loader2, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import { apiClient } from "@/lib/api";
import { ApiResponse } from "@/types/api";
import { debounce } from "lodash";
import OAuthButtons from "@/components/auth/OAuthButtons";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Validation States
  const [checkingFullName, setCheckingFullName] = useState(false);
  const [fullNameStatus, setFullNameStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "valid" | "invalid">("idle");

  // Logic kiểm tra trùng lặp với Debounce
  const checkAvailabilityRef = useRef(
    debounce(async (value: string, type: "fullname" | "email") => {
      if (!value || value.length < (type === "fullname" ? 3 : 5)) {
        if (type === "fullname") setFullNameStatus("idle");
        else setEmailStatus("idle");
        return;
      }

      if (type === "fullname") setCheckingFullName(true);
      else setCheckingEmail(true);

      try {
        const res = await apiClient.get<ApiResponse<{ available: boolean }>>(
          `/auth/check-availability?value=${value}&type=${type}`,
        ) as unknown as ApiResponse<{ available: boolean }>;
        
        if (res.success && res.data) {
          if (type === "fullname") {
            setFullNameStatus(res.data.available ? "valid" : "invalid");
          } else {
            setEmailStatus(res.data.available ? "valid" : "invalid");
          }
        }
      } catch (err) {
        console.error(`Error checking ${type} availability:`, err);
      } finally {
        if (type === "fullname") setCheckingFullName(false);
        else setCheckingEmail(false);
      }
    }, 500)
  );

  const checkAvailability = checkAvailabilityRef.current;

  useEffect(() => {
    checkAvailability(fullName, "fullname");
  }, [fullName, checkAvailability]);

  useEffect(() => {
    checkAvailability(email, "email");
  }, [email, checkAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullNameStatus === "invalid" || emailStatus === "invalid") return;
    
    setLoading(true);
    setError("");

    try {
      const res = await apiClient.post<ApiResponse<void>>("/auth/register", {
        full_name: fullName,
        email: email,
        password: password,
      }) as unknown as ApiResponse<void>;

      if (res.success) {
        router.push("/login?registered=true");
      } else {
        setError(res.error || "Đăng ký thất bại, vui lòng thử lại.");
      }
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } }).response?.data?.error ||
          "Đăng ký thất bại, vui lòng kiểm tra lại thông tin.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      reverse={true}
      bannerImage="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2070&auto=format&fit=crop"
      bannerTitle="Khám Phá Thế Giới Phim Ảnh"
      bannerSubtitle="Tạo thẻ thành viên trực tuyến ngay hôm nay để nhận được hàng nghìn voucher ưu đãi và tham gia các sự kiện điện ảnh."
    >
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
          Đăng Ký
        </h1>
        <p className="text-gray-400">
          Gia nhập cộng đồng người yêu điện ảnh lớn nhất.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between">
            Họ và tên
            {checkingFullName && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
          </label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className={`w-full bg-[#111] border rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-gray-600 focus:outline-none transition-all font-medium shadow-inner ${
                fullNameStatus === "valid" ? "border-green-500/50 focus:border-green-500" : 
                fullNameStatus === "invalid" ? "border-red-500/50 focus:border-red-500" : 
                "border-[#222] focus:border-primary"
              }`}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {fullNameStatus === "valid" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              {fullNameStatus === "invalid" && <AlertCircle className="w-5 h-5 text-red-500" />}
            </div>
          </div>
          {fullNameStatus === "invalid" && (
            <p className="text-[11px] font-bold text-red-500 px-1 animate-in fade-in slide-in-from-top-1">Họ tên này đã được sử dụng, vui lòng thử tên khác.</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between">
            Email
            {checkingEmail && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
          </label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className={`w-full bg-[#111] border rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-gray-600 focus:outline-none transition-all font-medium shadow-inner ${
                emailStatus === "valid" ? "border-green-500/50 focus:border-green-500" : 
                emailStatus === "invalid" ? "border-red-500/50 focus:border-red-500" : 
                "border-[#222] focus:border-primary"
              }`}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {emailStatus === "valid" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              {emailStatus === "invalid" && <AlertCircle className="w-5 h-5 text-red-500" />}
            </div>
          </div>
          {emailStatus === "invalid" && (
            <p className="text-[11px] font-bold text-red-500 px-1 animate-in fade-in slide-in-from-top-1">Email này đã được sử dụng bởi một tài khoản khác.</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mật khẩu</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              className="w-full bg-[#111] border border-[#222] rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-all font-medium shadow-inner"
            />
          </div>
        </div>

        {/* Error Message (Global) */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold flex gap-3 items-center mt-2 relative z-10 animate-in zoom-in-95">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password || !fullName || fullNameStatus === "invalid" || emailStatus === "invalid"}
          className="w-full bg-primary hover:bg-[#ff1e1e] text-white font-black py-4 rounded-xl flex justify-center items-center gap-2 transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed group shadow-[0_8px_30px_rgb(229,9,20,0.2)] hover:shadow-[0_8px_40px_rgb(229,9,20,0.4)] mt-4 active:scale-[0.98]"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Xác Nhận Đăng Ký{" "}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <OAuthButtons />

      <div className="mt-8 text-center text-xs text-gray-500 font-bold uppercase tracking-widest">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="text-primary hover:text-white transition-colors ml-1"
        >
          Đăng nhập ngay
        </Link>
      </div>
    </AuthSplitLayout>
  );
}
