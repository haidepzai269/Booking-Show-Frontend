"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import { useAuthStore } from "@/store/authStore";

function MagicLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyMagicLink, loading, error } = useAuthStore();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setVerifying(false);
      return;
    }

    const verify = async () => {
      const success = await verifyMagicLink(token);
      if (success) {
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
      setVerifying(false);
    };

    verify();
  }, [searchParams, verifyMagicLink, router]);

  return (
    <AuthSplitLayout
      reverse={true}
      bannerImage="https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2070&auto=format&fit=crop"
      bannerTitle="Đang xác thực..."
      bannerSubtitle="Chúng tôi đang kiểm tra thông tin để đưa bạn trở lại với rạp chiếu phim."
    >
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        {verifying || loading ? (
          <div className="space-y-4">
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Đang xử lý Magic Link
              </h2>
              <p className="text-gray-400 text-sm">
                Vui lòng chờ trong giây lát...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="space-y-6">
            <div className="p-8 bg-red-500/10 border border-red-500/30 rounded-2xl">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4 mx-auto" />
              <h3 className="text-xl font-bold text-white mb-2">
                Xác thực thất bại
              </h3>
              <p className="text-gray-400 text-sm">{error}</p>
            </div>
            <button
              onClick={() => router.push("/forgot-password")}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-all"
            >
              Thử gửi lại link khác
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in zoom-in duration-500">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Đăng nhập thành công!
              </h2>
              <p className="text-gray-400 text-sm">
                Đang chuyển hướng về trang chủ...
              </p>
            </div>
          </div>
        )}
      </div>
    </AuthSplitLayout>
  );
}

import { Suspense } from "react";

export default function MagicLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-black">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      }
    >
      <MagicLoginContent />
    </Suspense>
  );
}
