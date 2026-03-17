"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Popcorn } from "lucide-react";
import NextImage from "next/image";
import ConcessionFormModal from "@/components/admin/concessions/ConcessionFormModal";
import { apiClient } from "@/lib/api";

interface Concession {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_active: boolean;
}

export default function ConcessionsPage() {
  const [concessions, setConcessions] = useState<Concession[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const limit = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConcession, setEditingConcession] = useState<Concession | null>(
    null,
  );

  const fetchConcessions = useCallback(async () => {
    try {
      setLoading(true);
      const res = (await apiClient.get(
        `/admin/concessions?page=${page}&limit=${limit}&q=${search}`,
      )) as { success: boolean; data: Concession[]; meta: { total: number } };
      if (res.success) {
        setConcessions(res.data);
        setTotal(res.meta.total);
      }
    } catch (error) {
      console.error("Error fetching concessions:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchConcessions();
  }, [fetchConcessions]);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đồ ăn này?")) return;
    try {
      await apiClient.delete(`/admin/concessions/${id}`);
      fetchConcessions();
    } catch (error) {
      console.error("Error deleting concession:", error);
      alert("Xóa thất bại");
    }
  };

  const handleEdit = (c: Concession) => {
    setEditingConcession(c);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingConcession(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
            Quản lý Đồ ăn & Thức uống
          </h1>
          <p className="text-zinc-400 mt-1">
            Danh sách bắp nước và combo (Phase 2)
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm Combo / Đồ ăn
        </button>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <input
            type="text"
            placeholder="Tìm kiếm đồ ăn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-800/50 border border-zinc-700 text-white px-4 py-2 rounded-lg w-64 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50 text-zinc-400 text-sm">
              <tr>
                <th className="px-6 py-4">Tên Sản phẩm</th>
                <th className="px-6 py-4">Mô tả</th>
                <th className="px-6 py-4">Giá bán</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-zinc-500"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : concessions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-zinc-500"
                  >
                    Không tìm thấy sản phẩm nào
                  </td>
                </tr>
              ) : (
                concessions.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 relative">
                          {c.image_url ? (
                            <NextImage
                              src={c.image_url}
                              alt={c.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Popcorn className="w-6 h-6 text-zinc-500" />
                          )}
                        </div>
                        <div className="font-medium text-zinc-100">
                          {c.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">
                      <div className="max-w-xs truncate" title={c.description}>
                        {c.description || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-red-400">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(c.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          c.is_active
                            ? "bg-green-500/10 text-green-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {c.is_active ? "Kinh doanh" : "Tạm ngưng"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
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

        <div className="p-4 border-t border-zinc-800 flex justify-between items-center text-sm text-zinc-400">
          <div>
            Hiển thị {concessions.length} / {total} sản phẩm
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

      <ConcessionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchConcessions}
        concession={editingConcession}
      />
    </div>
  );
}
