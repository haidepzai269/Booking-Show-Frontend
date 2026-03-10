"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/api";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Shield,
  Ticket,
  ShoppingBag,
  DollarSign,
  Edit2,
  Check,
  X,
  Key,
  History,
  Loader2,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import MembershipCard from "@/components/profile/MembershipCard";

interface ProfileData {
  user: {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    role: string;
    rank: string;
    total_spending: number;
    created_at: string;
  };
  total_orders: number;
  total_tickets: number;
  total_spent: number;
}

interface Movie {
  id: number;
  poster_url: string;
  title: string;
}

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getRoleBadge(role: string) {
  const map: Record<string, { label: string; color: string }> = {
    ADMIN: {
      label: "Admin",
      color: "bg-red-500/20 text-red-400 border-red-500/30",
    },
    CINEMA_MANAGER: {
      label: "Quản lý",
      color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    },
    CUSTOMER: {
      label: "Thành viên",
      color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
  };
  return map[role] || map.CUSTOMER;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, setAuth, token, _hasHydrated } = useAuthStore();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [bannerPosters, setBannerPosters] = useState<string[]>([]);

  useEffect(() => {
    if (!_hasHydrated) return; // Chờ Hydration xong mới kiểm tra Auth

    if (!authUser) {
      router.push("/login");
      return;
    }
    fetchProfile();
    fetchBannerPosters();
  }, [authUser, _hasHydrated]);

  const fetchBannerPosters = async () => {
    try {
      const res = await apiClient.get<
        any,
        { success: boolean; data: { hot: Movie[]; best_selling: Movie[] } }
      >("/movies/home");
      if (res.success && res.data) {
        const all = [...(res.data.hot || []), ...(res.data.best_selling || [])];
        const unique = Array.from(new Map(all.map((m) => [m.id, m])).values());
        setBannerPosters(
          unique
            .slice(0, 8)
            .map((m) => m.poster_url)
            .filter(Boolean),
        );
      }
    } catch {
      // fallback: banner vẫn render với overlay tối
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = (await apiClient.get("/users/me")) as {
        success: boolean;
        data: ProfileData;
      };
      if (res.success) {
        setProfile(res.data);
        setForm({
          full_name: res.data.user.full_name,
          phone: res.data.user.phone || "",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) return;
    setSaving(true);
    setSaveStatus("idle");
    try {
      const res = (await apiClient.put("/users/me", {
        full_name: form.full_name,
        phone: form.phone,
      })) as { success: boolean };

      if (res.success) {
        setSaveStatus("success");
        setEditing(false);
        // Cập nhật authStore để tên ở Header cũng cập nhật
        if (authUser && token) {
          setAuth(token, { ...authUser, fullName: form.full_name });
        }
        await fetchProfile();
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        full_name: profile.user.full_name,
        phone: profile.user.phone || "",
      });
    }
    setEditing(false);
    setSaveStatus("idle");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#e50914] animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const roleBadge = getRoleBadge(profile.user.role);
  const initials = profile.user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const getRankProgress = (currentSpending: number, currentRank: string) => {
    const thresholds = [
      { rank: "BRONZE", min: 0, max: 2000000 },
      { rank: "SILVER", min: 2000000, max: 5000000 },
      { rank: "GOLD", min: 5000000, max: 10000000 },
      { rank: "PLATINUM", min: 10000000, max: 20000000 },
      { rank: "DIAMOND", min: 20000000, max: Infinity },
    ];

    const currentIndex = thresholds.findIndex((t) => t.rank === currentRank);
    if (currentIndex === -1 || currentIndex === thresholds.length - 1) {
      return { percentage: 100, remaining: 0, nextRank: "MAX" };
    }

    const current = thresholds[currentIndex];
    const next = thresholds[currentIndex + 1];
    const percentage = Math.min(
      100,
      ((currentSpending - current.min) / (next.min - current.min)) * 100,
    );
    const remaining = next.min - currentSpending;

    return { percentage, remaining, nextRank: next.rank };
  };

  const rankProgress = getRankProgress(
    profile.user.total_spending,
    profile.user.rank,
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* ── HERO BANNER – Movie Poster Mosaic ────────────────────── */}
      <div className="relative h-52 overflow-hidden">
        {/* Poster strip */}
        {bannerPosters.length > 0 ? (
          <div className="absolute inset-0 flex">
            {bannerPosters.map((url, i) => (
              <div
                key={i}
                className="flex-1 min-w-0"
                style={{
                  backgroundImage: `url(${url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center top",
                }}
              />
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 bg-[#1a1a1a]" />
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/70 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/60 via-transparent to-[#0a0a0a]/60" />
        {/* Red accent strip at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#e50914] to-transparent opacity-60" />

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 h-full flex flex-col justify-end pb-6">
          <nav className="text-sm text-white/50 mb-2">
            <Link href="/" className="hover:text-white transition-colors">
              Trang chủ
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white/80">Hồ sơ cá nhân</span>
          </nav>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Hồ sơ cá nhân
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-16">
        {/* ── PROFILE HEADER ──────────────────────────────────────── */}
        <div className="mt-8 mb-8 bg-[#111] border border-white/[0.07] rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-end gap-6 shadow-2xl">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#e50914] to-[#e67e22] flex items-center justify-center text-white text-3xl font-black shadow-[0_0_30px_rgba(229,9,20,0.5)] border-4 border-[#111]">
              {initials}
            </div>
          </div>

          {/* Name & badge */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-xl font-black text-white">
                {profile.user.full_name}
              </h2>
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${roleBadge.color} w-fit mx-auto sm:mx-0`}
              >
                <Shield className="w-3 h-3" />
                {roleBadge.label}
              </span>
            </div>
            <p className="text-white/40 text-sm mt-1">{profile.user.email}</p>
            <p className="text-white/30 text-xs flex items-center gap-1 mt-1 justify-center sm:justify-start">
              <CalendarDays className="w-3 h-3" />
              Thành viên từ {formatDate(profile.user.created_at)}
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 shrink-0">
            {profile.user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="px-4 py-2 bg-[#e50914] hover:bg-[#c0392b] text-white text-sm font-bold rounded-xl transition-colors"
              >
                Admin Panel
              </Link>
            )}
            <Link
              href="/orders/my"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium rounded-xl border border-white/10 transition-colors"
            >
              Đơn hàng
            </Link>
          </div>
        </div>

        {/* ── MAIN GRID ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Stats */}
          <div className="lg:col-span-1 space-y-4">
            {/* Membership Card */}
            <MembershipCard
              rank={profile.user.role === "ADMIN" ? "ADMIN" : profile.user.rank}
              fullName={profile.user.full_name}
              totalSpending={profile.user.total_spending}
            />

            {/* Rank Progress Bar - Only for Customers */}
            {profile.user.role === "CUSTOMER" && (
              <div className="bg-[#111] border border-white/[0.07] rounded-2xl p-5">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">
                    Tiến trình thăng hạng
                  </span>
                  {rankProgress.nextRank !== "MAX" && (
                    <span className="text-white/80 text-[10px] font-medium">
                      {formatVND(rankProgress.remaining)} nữa để lên{" "}
                      {rankProgress.nextRank}
                    </span>
                  )}
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${rankProgress.percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[#e50914] to-[#f5c518]"
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[9px] text-white/40 uppercase font-bold">
                    {profile.user.rank}
                  </span>
                  <span className="text-[9px] text-white/40 uppercase font-bold">
                    {rankProgress.nextRank === "MAX"
                      ? "DIAMOND"
                      : rankProgress.nextRank}
                  </span>
                </div>
              </div>
            )}

            {/* Stats cards */}
            <div className="bg-[#111] border border-white/[0.07] rounded-2xl p-5">
              <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">
                Thống kê
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-white/70 text-sm">Đơn hàng</span>
                  </div>
                  <span className="text-white font-bold">
                    {profile.total_orders}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Ticket className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-white/70 text-sm">Vé đã mua</span>
                  </div>
                  <span className="text-white font-bold">
                    {profile.total_tickets}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-green-400" />
                    </div>
                    <span className="text-white/70 text-sm">Tổng chi tiêu</span>
                  </div>
                  <span className="text-[#f5c518] font-bold text-sm">
                    {formatVND(profile.total_spent)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-[#111] border border-white/[0.07] rounded-2xl p-5">
              <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">
                Truy cập nhanh
              </h3>
              <div className="space-y-2">
                <Link
                  href="/orders/my"
                  className="flex items-center gap-3 p-3 hover:bg-white/[0.05] rounded-xl transition-colors group"
                >
                  <History className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
                  <span className="text-white/60 text-sm group-hover:text-white/90 transition-colors">
                    Lịch sử đơn hàng
                  </span>
                </Link>
                <Link
                  href="/profile/tickets"
                  className="flex items-center gap-3 p-3 hover:bg-white/[0.05] rounded-xl transition-colors group"
                >
                  <Ticket className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
                  <span className="text-white/60 text-sm group-hover:text-white/90 transition-colors">
                    Vé của tôi
                  </span>
                </Link>
                <Link
                  href="/reset-password"
                  className="flex items-center gap-3 p-3 hover:bg-white/[0.05] rounded-xl transition-colors group"
                >
                  <Key className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
                  <span className="text-white/60 text-sm group-hover:text-white/90 transition-colors">
                    Đổi mật khẩu
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT: Info & Edit */}
          <div className="lg:col-span-2 space-y-4">
            {/* Personal Info Card */}
            <div className="bg-[#111] border border-white/[0.07] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white font-bold">Thông tin cá nhân</h3>
                  <p className="text-white/40 text-sm mt-0.5">
                    Cập nhật thông tin của bạn tại đây
                  </p>
                </div>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-medium rounded-xl border border-white/10 transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Chỉnh sửa
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/60 text-sm rounded-xl border border-white/10 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      Hủy
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || !form.full_name.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#e50914] hover:bg-[#c0392b] text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      Lưu
                    </button>
                  </div>
                )}
              </div>

              {/* Save status */}
              {saveStatus === "success" && (
                <div className="mb-4 flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Cập nhật thành công!
                </div>
              )}
              {saveStatus === "error" && (
                <div className="mb-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Có lỗi xảy ra. Vui lòng thử lại.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Họ và tên */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest">
                    Họ và tên
                  </label>
                  {editing ? (
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="text"
                        value={form.full_name}
                        onChange={(e) =>
                          setForm({ ...form, full_name: e.target.value })
                        }
                        placeholder="Nhập họ và tên"
                        className="w-full bg-white/[0.05] border border-white/10 focus:border-[#e50914] rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/20 outline-none transition-colors"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl">
                      <User className="w-4 h-4 text-white/30 shrink-0" />
                      <span className="text-white">
                        {profile.user.full_name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest">
                    Email
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                    <Mail className="w-4 h-4 text-white/20 shrink-0" />
                    <span className="text-white/50 text-sm truncate">
                      {profile.user.email}
                    </span>
                  </div>
                  <p className="text-white/25 text-xs pl-1">
                    Email không thể thay đổi
                  </p>
                </div>

                {/* Số điện thoại */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest">
                    Số điện thoại
                  </label>
                  {editing ? (
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                        placeholder="VD: 0912345678"
                        className="w-full bg-white/[0.05] border border-white/10 focus:border-[#e50914] rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/20 outline-none transition-colors"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl">
                      <Phone className="w-4 h-4 text-white/30 shrink-0" />
                      <span
                        className={
                          profile.user.phone
                            ? "text-white"
                            : "text-white/25 italic text-sm"
                        }
                      >
                        {profile.user.phone || "Chưa cập nhật"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Security Card */}
            <div className="bg-[#111] border border-white/[0.07] rounded-2xl p-6">
              <h3 className="text-white font-bold mb-1">
                Bảo mật &amp; Cài đặt
              </h3>
              <p className="text-white/40 text-sm mb-5">
                Quản lý mật khẩu và bảo mật tài khoản
              </p>

              <div className="space-y-3">
                {/* Đổi mật khẩu */}
                <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.05] rounded-xl hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                      <Key className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        Đổi mật khẩu
                      </p>
                      <p className="text-white/40 text-xs">
                        Sử dụng mật khẩu mạnh để bảo vệ tài khoản
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/reset-password"
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold rounded-lg border border-white/10 transition-colors"
                  >
                    Đổi ngay
                  </Link>
                </div>

                {/* Loại tài khoản */}
                <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.05] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        Loại tài khoản
                      </p>
                      <p className="text-white/40 text-xs">
                        Quyền hạn trong hệ thống
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${roleBadge.color}`}
                  >
                    {roleBadge.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
