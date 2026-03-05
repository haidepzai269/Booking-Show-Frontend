"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { ...formData, role: "USER" };

      const res = await apiClient.post<any, ApiResponse>(endpoint, payload);

      if (res.success) {
        if (!isLogin) {
          // Đoạn check Register return User, tự động gọi SetAuth nếu backend trả token
          setIsLogin(true); // Switch qua login
          setError("Đăng ký thành công! Hãy đăng nhập lại.");
        } else {
          // Login
          setAuth(res.data.access_token, res.data.user);
          onClose(); // Tắt modal
        }
      } else {
        setError(res.error || "Có lỗi xảy ra");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể kết nối Server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card w-full max-w-md rounded-2xl overflow-hidden border border-border shadow-2xl relative"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black mb-2 text-white">
                  {isLogin ? "Đăng Nhập" : "Đăng Ký"}
                </h2>
                <p className="text-sm text-gray-400">
                  {isLogin
                    ? "Nhập email và mật khẩu của bạn để tận hưởng."
                    : "Trở thành thành viên của Booking Show ngay."}
                </p>
              </div>

              {error && (
                <div
                  className={`mb-4 p-3 rounded-lg text-sm text-center font-medium ${error.includes("thành công") ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Họ và tên"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full bg-background border border-border rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                      required={!isLogin}
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Địa chỉ Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-background border border-border rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full bg-background border border-border rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isLogin ? (
                    "Đăng nhập ngay"
                  ) : (
                    "Tạo tài khoản"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-400">
                {isLogin ? "Bạn chưa có tài khoản? " : "Đã có tài khoản? "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:text-white font-semibold transition-colors"
                >
                  {isLogin ? "Đăng ký" : "Đăng nhập ngay"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
