"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Megaphone, Eye, EyeOff } from "lucide-react";
import NextImage from "next/image";
import TableSkeleton from "@/components/admin/TableSkeleton";
import { apiClient } from "@/lib/api";

interface Campaign {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  banner_url: string;
  type: string;
  status: string;
  sort_order: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  BANK: "Ngân hàng",
  WALLET: "Ví điện tử",
  PARTNER: "Đối tác",
  MEMBER: "Thành viên",
  OTHER: "Khác",
};

const TYPE_COLORS: Record<string, string> = {
  BANK: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  WALLET: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  PARTNER: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  MEMBER: "bg-green-500/10 text-green-400 border-green-500/20",
  OTHER: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  ACTIVE: {
    label: "Đang chạy",
    cls: "bg-green-500/10 text-green-400 border border-green-500/20",
  },
  INACTIVE: {
    label: "Tạm dừng",
    cls: "bg-red-500/10 text-red-400 border border-red-500/20",
  },
  DRAFT: {
    label: "Bản nháp",
    cls: "bg-zinc-600/20 text-zinc-400 border border-zinc-700",
  },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const params = filterStatus ? `?status=${filterStatus}` : "";
      const res = (await apiClient.get(`/admin/campaigns${params}`)) as {
        data: Campaign[];
      };
      setCampaigns(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa chiến dịch "${title}"?`)) return;
    try {
      await apiClient.delete(`/admin/campaigns/${id}`);
      fetchCampaigns();
    } catch {
      alert("Xóa thất bại. Vui lòng thử lại.");
    }
  };

  const handleToggleStatus = async (c: Campaign) => {
    const newStatus = c.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await apiClient.put(`/admin/campaigns/${c.id}`, {
        ...c,
        status: newStatus,
        start_date: c.start_date
          ? new Date(c.start_date).toISOString().split("T")[0]
          : undefined,
        end_date: c.end_date
          ? new Date(c.end_date).toISOString().split("T")[0]
          : undefined,
      });
      fetchCampaigns();
    } catch {
      alert("Cập nhật trạng thái thất bại.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
            Chiến dịch Khuyến mãi
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Quản lý các chiến dịch marketing hiển thị trên trang
            /promotions/campaigns
          </p>
        </div>
        <Link
          href="/admin/campaigns/create"
          className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-orange-900/20 font-medium whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Tạo chiến dịch
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 flex-wrap">
        {["", "ACTIVE", "INACTIVE", "DRAFT"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filterStatus === s
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500"
            }`}
          >
            {s === "" ? "Tất cả" : STATUS_CONFIG[s]?.label || s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Chiến dịch</th>
                <th className="px-5 py-3.5">Loại</th>
                <th className="px-5 py-3.5">Trạng thái</th>
                <th className="px-5 py-3.5">Thời gian</th>
                <th className="px-5 py-3.5">Thứ tự</th>
                <th className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading ? (
                <TableSkeleton rows={8} cols={6} />
              ) : campaigns.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-zinc-500"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <Megaphone className="w-10 h-10 text-zinc-700" />
                      <p>Chưa có chiến dịch nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-zinc-800/20 transition-colors group"
                  >
                    {/* Title + Thumbnail */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3 max-w-xs">
                        <div className="w-14 h-10 rounded-md bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700 relative">
                          {c.thumbnail_url ? (
                            <NextImage
                              src={c.thumbnail_url}
                              alt={c.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Megaphone className="w-4 h-4 text-zinc-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-zinc-100 font-medium text-sm line-clamp-1">
                            {c.title}
                          </p>
                          <p className="text-zinc-500 text-xs line-clamp-1 mt-0.5">
                            {c.description || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Type */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${TYPE_COLORS[c.type] || TYPE_COLORS.OTHER}`}
                      >
                        {TYPE_LABELS[c.type] || c.type}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[c.status]?.cls || ""}`}
                      >
                        {STATUS_CONFIG[c.status]?.label || c.status}
                      </span>
                    </td>
                    {/* Dates */}
                    <td className="px-5 py-3.5 text-xs text-zinc-400">
                      <div>{formatDate(c.start_date)}</div>
                      <div className="text-zinc-600">
                        → {formatDate(c.end_date)}
                      </div>
                    </td>
                    {/* Sort */}
                    <td className="px-5 py-3.5 text-zinc-400 text-sm text-center">
                      {c.sort_order}
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleToggleStatus(c)}
                          title={
                            c.status === "ACTIVE" ? "Tạm dừng" : "Kích hoạt"
                          }
                          className={`p-1.5 rounded-lg transition-colors ${
                            c.status === "ACTIVE"
                              ? "text-green-400 hover:bg-green-500/10"
                              : "text-zinc-500 hover:bg-zinc-700"
                          }`}
                        >
                          {c.status === "ACTIVE" ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                        <Link
                          href={`/admin/campaigns/${c.id}/edit`}
                          className="p-1.5 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(c.id, c.title)}
                          className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-zinc-800 text-xs text-zinc-500">
          Tổng: {campaigns.length} chiến dịch
        </div>
      </div>
    </div>
  );
}
