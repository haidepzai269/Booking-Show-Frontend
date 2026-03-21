"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Eye, Receipt } from "lucide-react";
import OrderDetailModal from "@/components/admin/orders/OrderDetailModal";
import TableSkeleton from "@/components/admin/TableSkeleton";
import { apiClient } from "@/lib/api";

interface Order {
  id: string;
  user_id: number;
  showtime_id: number;
  original_amount: number;
  discount_amount: number;
  final_amount: number;
  status: string;
  created_at: string;
  User: {
    email: string;
    full_name: string;
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const limit = 15;

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = (await apiClient.get(
        `/admin/orders?page=${page}&limit=${limit}&q=${search}`,
      )) as { success: boolean; data: Order[]; meta: { total: number } };
      if (res.success) {
        setOrders(res.data);
        setTotal(res.meta.total);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
            Quản lý Đơn hàng
          </h1>
          <p className="text-zinc-400 mt-1">
            Lịch sử giao dịch, đặt vé của khách
          </p>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Tìm theo ID đơn hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-red-500 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-800/50 text-zinc-400">
              <tr>
                <th className="px-6 py-4">Mã Đơn hàng</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Tổng tiền</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <TableSkeleton rows={10} cols={6} />
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-zinc-500"
                  >
                    <Receipt className="w-8 h-8 opacity-50 mx-auto mb-2" />
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-zinc-300">
                      {o.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">
                        {o.User?.full_name}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {o.User?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-red-400">
                      {new Intl.NumberFormat("vi-VN").format(o.final_amount)}đ
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-[11px] font-bold tracking-wider ${
                          o.status === "COMPLETED"
                            ? "bg-green-500/10 text-green-500"
                            : o.status === "CANCELLED"
                              ? "bg-red-500/10 text-red-500"
                              : o.status === "FAILED"
                                ? "bg-orange-500/10 text-orange-500"
                                : "bg-blue-500/10 text-blue-500"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {new Date(o.created_at).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedOrderId(o.id)}
                        className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded transition mx-auto flex"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-zinc-800 flex justify-between items-center text-sm text-zinc-400">
          <div>
            Hiển thị {total > 0 ? (page - 1) * limit + 1 : 0} -{" "}
            {Math.min(page * limit, total)} / {total} đơn hàng
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

      <OrderDetailModal
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        orderId={selectedOrderId}
      />
    </div>
  );
}
