"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Undo2, CheckCircle2, XCircle } from "lucide-react";
import { apiClient } from "@/lib/api";

interface RefundOrder {
  id: string;
  user: {
    full_name: string;
    email: string;
  };
  showtime: {
    movie: {
      title: string;
    };
  };
}

interface Refund {
  id: string;
  order_id: string;
  order: RefundOrder;
  gateway: string;
  gateway_transaction_id: string;
  amount: number;
  reason: string;
  status: string; // PENDING | REFUNDED | FAILED
  created_at: string;
  resolved_at: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400",
  REFUNDED: "bg-green-500/10 text-green-400",
  FAILED: "bg-red-500/10 text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xử lý",
  REFUNDED: "Đã hoàn tiền",
  FAILED: "Thất bại",
};

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 15;

  const fetchRefunds = useCallback(async () => {
    try {
      setLoading(true);
      const res = (await apiClient.get(
        `/admin/refunds?page=${page}&limit=${limit}`,
      )) as { success: boolean; data: Refund[]; meta: { total: number } };
      if (res.success) {
        setRefunds(res.data ?? []);
        setTotal(res.meta.total);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
            Yêu cầu Hoàn tiền
          </h1>
          <p className="text-zinc-400 mt-1">
            Danh sách giao dịch đã thanh toán nhưng cần hoàn tiền cho khách
          </p>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-800/50 text-zinc-400">
              <tr>
                <th className="px-6 py-4">Mã Đơn (ID)</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Phim</th>
                <th className="px-6 py-4">Cổng TT</th>
                <th className="px-6 py-4">Số tiền hoàn</th>
                <th className="px-6 py-4">Lý do</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-zinc-500"
                  >
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Đang tải...
                  </td>
                </tr>
              ) : refunds.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-16 text-center text-zinc-500"
                  >
                    <Undo2 className="w-10 h-10 opacity-30 mx-auto mb-3" />
                    <p className="font-medium">
                      Không có yêu cầu hoàn tiền nào
                    </p>
                    <p className="text-xs mt-1 text-zinc-600">
                      Khi khách hàng thanh toán thành công nhưng đơn bị hủy, yêu
                      cầu hoàn tiền sẽ xuất hiện tại đây.
                    </p>
                  </td>
                </tr>
              ) : (
                refunds.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-zinc-300 text-xs">
                      <div>{r.order_id.substring(0, 8)}...</div>
                      <div className="text-zinc-600 text-[11px]">
                        Refund #{r.id.substring(0, 6)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">
                        {r.order?.user?.full_name || "—"}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {r.order?.user?.email || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-300 max-w-[160px] truncate">
                      {r.order?.showtime?.movie?.title || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-xs font-medium uppercase">
                        {r.gateway}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-red-400">
                      {new Intl.NumberFormat("vi-VN").format(r.amount)}đ
                    </td>
                    <td
                      className="px-6 py-4 text-zinc-400 text-xs max-w-[180px] truncate"
                      title={r.reason}
                    >
                      {r.reason || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${STATUS_STYLES[r.status] ?? "bg-zinc-700 text-zinc-300"}`}
                      >
                        {r.status === "REFUNDED" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : r.status === "FAILED" ? (
                          <XCircle className="w-3 h-3" />
                        ) : null}
                        {STATUS_LABELS[r.status] ?? r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-xs">
                      {new Date(r.created_at).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-zinc-800 flex justify-between items-center text-sm text-zinc-400">
          <div>
            Hiển thị {refunds.length} / {total} yêu cầu
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
    </div>
  );
}
