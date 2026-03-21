"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import {
  Plus,
  MapPin,
  Building2,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import NextImage from "next/image";
import CinemaFormModal from "@/components/admin/cinemas/CinemaFormModal";
import RoomPanel from "@/components/admin/cinemas/RoomPanel";
import TableSkeleton from "@/components/admin/TableSkeleton";
import { apiClient } from "@/lib/api";

interface Cinema {
  id: number;
  name: string;
  address: string;
  city: string;
  image_url: string;
  is_active: boolean;
}

export default function CinemasPage() {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const limit = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCinema, setEditingCinema] = useState<Cinema | null>(null);

  // Expanded Row State for Rooms
  const [expandedCinemaId, setExpandedCinemaId] = useState<number | null>(null);

  const fetchCinemas = useCallback(async () => {
    try {
      setLoading(true);
      const res = (await apiClient.get(
        `/admin/cinemas?page=${page}&limit=${limit}&q=${search}`,
      )) as { success: boolean; data: Cinema[]; meta: { total: number } };
      if (res.success) {
        setCinemas(res.data);
        setTotal(res.meta.total);
      }
    } catch (error) {
      console.error("Error fetching cinemas:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCinemas();
  }, [fetchCinemas]);

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn xóa rạp này? Toàn bộ phòng và suất chiếu sẽ bị ảnh hưởng.",
      )
    )
      return;

    try {
      await apiClient.delete(`/admin/cinemas/${id}`);
      fetchCinemas();
    } catch (error) {
      console.error("Error deleting cinema:", error);
      alert("Xóa rạp thất bại");
    }
  };

  const handleEdit = (cinema: Cinema) => {
    setEditingCinema(cinema);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCinema(null);
    setIsModalOpen(true);
  };

  const toggleExpand = (id: number) => {
    setExpandedCinemaId(expandedCinemaId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
            Quản lý Rạp
          </h1>
          <p className="text-zinc-400 mt-1">
            Quản lý danh sách rạp và phòng chiếu (Phase 2)
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm rạp mới
        </button>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <input
            type="text"
            placeholder="Tìm kiếm rạp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-800/50 border border-zinc-700 text-white px-4 py-2 rounded-lg w-64 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50 text-zinc-400 text-sm">
              <tr>
                <th className="px-6 py-4 w-12"></th>
                <th className="px-6 py-4">Tên Rạp</th>
                <th className="px-6 py-4">Địa chỉ</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <TableSkeleton rows={8} cols={5} />
              ) : cinemas.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-zinc-500"
                  >
                    Không tìm thấy rạp nào
                  </td>
                </tr>
              ) : (
                cinemas.map((cinema) => (
                  <Fragment key={cinema.id}>
                    <tr
                      className="hover:bg-zinc-800/30 transition-colors cursor-pointer"
                      onClick={() => toggleExpand(cinema.id)}
                    >
                      <td className="px-6 py-4">
                        {expandedCinemaId === cinema.id ? (
                          <ChevronDown className="w-5 h-5 text-zinc-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-zinc-400" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden relative">
                            {cinema.image_url ? (
                              <NextImage
                                src={cinema.image_url}
                                alt={cinema.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Building2 className="w-5 h-5 text-zinc-500" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-zinc-100">
                              {cinema.name}
                            </div>
                            <div className="text-sm text-zinc-500">
                              {cinema.city}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate max-w-[200px]">
                            {cinema.address}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            cinema.is_active
                              ? "bg-green-500/10 text-green-500"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {cinema.is_active ? "Hoạt động" : "Tạm ngưng"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div
                          className="flex justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleEdit(cinema)}
                            className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cinema.id)}
                            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expaned Room Panel */}
                    {expandedCinemaId === cinema.id && (
                      <tr className="bg-zinc-900/80 border-l-2 border-red-500">
                        <td colSpan={5} className="p-0">
                          <RoomPanel cinemaId={cinema.id} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (Simplified for now) */}
        <div className="p-4 border-t border-zinc-800 flex justify-between items-center text-sm text-zinc-400">
          <div>
            Hiển thị {total > 0 ? (page - 1) * limit + 1 : 0} -{" "}
            {Math.min(page * limit, total)} / {total} rạp
          </div>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 bg-zinc-800 rounded disabled:opacity-50"
            >
              Trước
            </button>
            <button
              disabled={page * limit >= total}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 bg-zinc-800 rounded disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      <CinemaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCinemas}
        cinema={editingCinema}
      />
    </div>
  );
}
