"use client";

interface RecentOrder {
  id: string;
  user_name: string;
  user_email: string;
  movie_title: string;
  final_amount: number;
  status: string;
  created_at: string;
}

interface RecentOrdersTableProps {
  orders: RecentOrder[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  COMPLETED: {
    label: "Hoàn thành",
    className: "bg-green-500/15 text-green-400 border border-green-500/20",
  },
  PENDING: {
    label: "Đang chờ",
    className: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "bg-red-500/15 text-red-400 border border-red-500/20", // Giữ nguyên đỏ cho trang thái hủy
  },
};

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortenId(id: string) {
  return "#" + id.substring(0, 8).toUpperCase();
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12 text-white/30">
        <p>Chưa có đơn hàng nào</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border-color)]">
            <th className="text-left py-3 px-4 text-[var(--text-secondary)] font-medium text-xs uppercase tracking-wider">
              Mã đơn
            </th>
            <th className="text-left py-3 px-4 text-[var(--text-secondary)] font-medium text-xs uppercase tracking-wider">
              Khách hàng
            </th>
            <th className="text-left py-3 px-4 text-[var(--text-secondary)] font-medium text-xs uppercase tracking-wider hidden md:table-cell">
              Phim
            </th>
            <th className="text-right py-3 px-4 text-[var(--text-secondary)] font-medium text-xs uppercase tracking-wider">
              Tổng tiền
            </th>
            <th className="text-center py-3 px-4 text-[var(--text-secondary)] font-medium text-xs uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="text-right py-3 px-4 text-[var(--text-secondary)] font-medium text-xs uppercase tracking-wider hidden lg:table-cell">
              Thời gian
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.03]">
          {orders.map((order) => {
            const status = statusConfig[order.status] || {
              label: order.status,
              className: "bg-white/10 text-white/50",
            };
            return (
              <tr
                key={order.id}
                className="hover:bg-white/[0.02] transition-colors group"
              >
                <td className="py-3.5 px-4">
                  <span className="font-mono text-white/60 text-xs group-hover:text-white/80 transition-colors">
                    {shortenId(order.id)}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <div>
                    <p className="text-white/80 font-medium text-xs">
                      {order.user_name}
                    </p>
                    <p className="text-white/30 text-[11px]">
                      {order.user_email}
                    </p>
                  </div>
                </td>
                <td className="py-3.5 px-4 hidden md:table-cell">
                  <p className="text-white/60 text-xs truncate max-w-[160px]">
                    {order.movie_title}
                  </p>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="text-white font-semibold text-xs">
                    {formatVND(order.final_amount)}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${status.className}`}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right hidden lg:table-cell">
                  <span className="text-white/30 text-[11px]">
                    {formatDate(order.created_at)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
