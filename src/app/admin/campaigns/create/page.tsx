"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import { ArrowLeft, Upload, Megaphone, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";

const CAMPAIGN_TYPES = [
  { value: "BANK", label: "🏦 Ngân hàng" },
  { value: "WALLET", label: "💳 Ví điện tử" },
  { value: "PARTNER", label: "🤝 Đối tác" },
  { value: "MEMBER", label: "⭐ Thành viên" },
  { value: "OTHER", label: "🎁 Khác" },
];

export default function CreateCampaignPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    thumbnail_url: "",
    banner_url: "",
    type: "OTHER",
    how_to_avail: "",
    terms_conditions: "",
    start_date: "",
    end_date: "",
    status: "DRAFT",
    sort_order: 0,
  });

  const set = (key: string, val: string | number) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await apiClient.post("/admin/campaigns", {
        ...form,
        sort_order: Number(form.sort_order),
        start_date: form.start_date || undefined,
        end_date: form.end_date || undefined,
      });
      router.push("/admin/campaigns");
    } catch {
      alert("Tạo chiến dịch thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/campaigns"
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Tạo chiến dịch mới</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Nội dung sẽ hiển thị trên trang <code>/promotions/campaigns</code>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              Thông tin cơ bản
            </h2>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="VD: Ưu đãi Thẻ tín dụng VietcomBank - Giảm 50%"
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors placeholder:text-zinc-600"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">
                Mô tả ngắn
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Tóm tắt ngắn gọn về ưu đãi..."
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors resize-none placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* How to avail */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              Hướng dẫn sử dụng
            </h2>
            <p className="text-xs text-zinc-500">
              Mô tả các bước áp dụng ưu đãi. Hỗ trợ xuống hàng để tách bước.
            </p>
            <textarea
              rows={5}
              value={form.how_to_avail}
              onChange={(e) => set("how_to_avail", e.target.value)}
              placeholder={
                "Bước 1: Chọn phim và suất chiếu\nBước 2: Thanh toán bằng thẻ VietcomBank\nBước 3: Nhận ưu đãi tự động áp dụng"
              }
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors resize-none placeholder:text-zinc-600 font-mono text-sm"
            />
          </div>

          {/* Terms */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              Điều khoản & Điều kiện
            </h2>
            <textarea
              rows={6}
              value={form.terms_conditions}
              onChange={(e) => set("terms_conditions", e.target.value)}
              placeholder="- Ưu đãi áp dụng cho chủ thẻ VietcomBank Visa/Mastercard\n- Tối đa giảm 100.000đ/giao dịch\n- Không áp dụng cùng các ưu đãi khác..."
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors resize-none placeholder:text-zinc-600 font-mono text-sm"
            />
          </div>
        </div>

        {/* Right: Settings */}
        <div className="space-y-5">
          {/* Status & Type */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              Cài đặt
            </h2>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">
                Trạng thái
              </label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="DRAFT">📝 Bản nháp</option>
                <option value="ACTIVE">✅ Đang chạy</option>
                <option value="INACTIVE">⏸️ Tạm dừng</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">
                Loại khuyến mãi
              </label>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors"
              >
                {CAMPAIGN_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">
                Thứ tự hiển thị
              </label>
              <input
                type="number"
                min={0}
                value={form.sort_order}
                onChange={(e) => set("sort_order", e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors"
              />
              <p className="text-xs text-zinc-600 mt-1">
                Số nhỏ hơn = hiển thị trước
              </p>
            </div>
          </div>

          {/* Date range */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              Thời gian
            </h2>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => set("start_date", e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">
                Ngày kết thúc
              </label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => set("end_date", e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* Images */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4" /> Hình ảnh
            </h2>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">
                URL ảnh Thumbnail
              </label>
              <input
                type="url"
                value={form.thumbnail_url}
                onChange={(e) => set("thumbnail_url", e.target.value)}
                placeholder="https://..."
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors placeholder:text-zinc-600 text-sm"
              />
              {form.thumbnail_url && (
                <div className="mt-2 rounded-lg overflow-hidden border border-zinc-700 aspect-video relative">
                  <NextImage
                    src={form.thumbnail_url}
                    alt="Thumbnail"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">
                URL ảnh Banner (Cover)
              </label>
              <input
                type="url"
                value={form.banner_url}
                onChange={(e) => set("banner_url", e.target.value)}
                placeholder="https://..."
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors placeholder:text-zinc-600 text-sm"
              />
              {form.banner_url && (
                <div className="mt-2 rounded-lg overflow-hidden border border-zinc-700 aspect-video relative">
                  <NextImage
                    src={form.banner_url}
                    alt="Banner"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-zinc-600">
              Dán URL ảnh trực tiếp. Bạn có thể upload ảnh trước tại{" "}
              <Link href="/admin" className="text-orange-400 hover:underline">
                trang upload
              </Link>
              .
            </p>
          </div>

          {/* Preview card */}
          {form.title && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider font-medium">
                Xem trước thẻ
              </p>
              <div className="rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700">
                <div className="aspect-video bg-zinc-700 relative">
                  {form.thumbnail_url ? (
                    <NextImage
                      src={form.thumbnail_url}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Megaphone className="w-8 h-8 text-zinc-600" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-white text-sm font-semibold line-clamp-2">
                    {form.title}
                  </p>
                  {form.description && (
                    <p className="text-zinc-400 text-xs mt-1 line-clamp-1">
                      {form.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all font-medium disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Đang lưu..." : "Tạo chiến dịch"}
        </button>
        <Link
          href="/admin/campaigns"
          className="px-6 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors font-medium"
        >
          Hủy
        </Link>
      </div>
    </form>
  );
}
