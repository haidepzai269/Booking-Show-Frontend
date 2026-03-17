"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react";
import PromotionFormModal from "@/components/admin/promotions/PromotionFormModal";
import { apiClient } from "@/lib/api";

interface Promotion {
  id: number;
  code: string;
  description: string;
  discount_amount: number;
  min_order_value: number;
  valid_from: string;
  valid_until: string;
  usage_limit: number;
  used_count: number;
  is_active: boolean;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const limit = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      const res = (await apiClient.get(
        `/admin/promotions?page=${page}&limit=${limit}&q=${search}`,
      )) as { success: boolean; data: Promotion[]; meta: { total: number } };
      if (res.success) {
        setPromotions(res.data);
        setTotal(res.meta.total);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, search, limit]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const handleDelete = async (id: number) => {
    if (!confirm("Vô hiệu hóa voucher này?")) return;
    try {
      await apiClient.delete(`/admin/promotions/${id}`);
      fetchPromotions();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (p: Promotion) => {
    setEditingPromo(p);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingPromo(null);
    setIsModalOpen(true);
  };

  const isExpired = (until: string) => {
    return new Date(until) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
            Quản lý Khuyến mãi
          </h1>
          <p className="text-zinc-400 mt-1">
            Mã giảm giá, voucher cho khách hàng
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tạo Voucher mới
        </button>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <input
            type="text"
            placeholder="Tìm mã voucher hoặc mô tả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-800/50 border border-zinc-700 text-white px-4 py-2 rounded-lg w-72 focus:outline-none focus:border-red-500 transition"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50 text-zinc-400 text-sm">
              <tr>
                <th className="px-6 py-4">Mã Voucher</th>
                <th className="px-6 py-4">Mức giảm</th>
                <th className="px-6 py-4">Điều kiện</th>
                <th className="px-6 py-4">Hiệu lực</th>
                <th className="px-6 py-4">Đã dùng</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-zinc-500"
                  >
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : promotions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-zinc-500"
                  >
                    <AlertCircle className="w-8 h-8 opacity-50 mx-auto mb-2" />
                    Không tìm thấy voucher nào
                  </td>
                </tr>
              ) : (
                promotions.map((p) => {
                  const expired = isExpired(p.valid_until);
                  const empty = p.used_count >= p.usage_limit;
                  const valid = p.is_active && !expired && !empty;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-red-500 bg-red-500/10 px-2 py-1 inline-block rounded border border-red-500/20">
                          {p.code}
                        </div>
                        <div
                          className="text-xs text-zinc-400 mt-1 max-w-[150px] truncate"
                          title={p.description}
                        >
                          {p.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-zinc-200">
                        {new Intl.NumberFormat("vi-VN").format(
                          p.discount_amount,
                        )}
                        đ
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-400">
                        Đơn từ:{" "}
                        {new Intl.NumberFormat("vi-VN").format(
                          p.min_order_value,
                        )}
                        đ
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-300">
                        <div>
                          Từ:{" "}
                          {new Date(p.valid_from).toLocaleDateString("vi-VN")}
                        </div>
                        <div className={expired ? "text-red-400" : ""}>
                          Đến:{" "}
                          {new Date(p.valid_until).toLocaleDateString("vi-VN")}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={
                            empty ? "text-red-400 font-medium" : "text-zinc-300"
                          }
                        >
                          {p.used_count} / {p.usage_limit}
                        </span>
                        {empty && (
                          <div className="text-[10px] text-red-500">
                            Hết lượt
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            valid
                              ? "bg-green-500/10 text-green-500"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {valid ? "Đang chạy" : "Không hiệu lực"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-zinc-800 flex justify-between items-center text-sm text-zinc-400">
          <div>
            Hiển thị {promotions.length} / {total} voucher
          </div>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 bg-zinc-800 rounded disabled:opacity-50 hover:bg-zinc-700"
            >
              Trước
            </button>
            <button
              disabled={page * limit >= total}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 bg-zinc-800 rounded disabled:opacity-50 hover:bg-zinc-700"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      <PromotionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPromotions}
        promotion={editingPromo}
      />
    </div>
  );
}
