"use client";

import {
  X,
  Receipt,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import NextImage from "next/image";
import { apiClient } from "@/lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
}

interface OrderDetail {
  id: string;
  status: string;
  original_amount: number;
  discount_amount: number;
  final_amount: number;
  User?: {
    full_name: string;
    email: string;
  };
  showtime?: {
    start_time: string;
    movie?: {
      title: string;
      poster_url: string;
    };
    room?: {
      name: string;
      cinema?: {
        name: string;
      };
    };
  };
}

export default function OrderDetailModal({ isOpen, onClose, orderId }: Props) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await apiClient.get(`/admin/orders/${orderId}`)) as {
        success: boolean;
        data: OrderDetail;
      };
      if (res.success) {
        setOrder(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    }
  }, [isOpen, orderId, fetchOrderDetails]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh] shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 border-b border-zinc-800 flex justify-between items-start bg-zinc-950 sticky top-0">
          <div>
            <h2 className="text-xl font-bold text-white flex gap-2 items-center">
              <Receipt className="w-5 h-5 text-red-500" />
              Chi tiết đơn hàng{" "}
              {orderId && (
                <span className="font-mono text-sm text-zinc-400 ml-2">
                  #{orderId.substring(0, 8)}...
                </span>
              )}
            </h2>
            {order && (
              <span
                className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full ${
                  order.status === "COMPLETED"
                    ? "bg-green-500/10 text-green-500"
                    : order.status === "CANCELLED"
                      ? "bg-red-500/10 text-red-500"
                      : order.status === "FAILED"
                        ? "bg-orange-500/10 text-orange-500"
                        : "bg-blue-500/10 text-blue-500"
                }`}
              >
                {order.status}
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-20 text-center text-zinc-500">
              Đang tải dữ liệu...
            </div>
          ) : order ? (
            <div className="space-y-6">
              {/* Thông tin Khách hàng */}
              <div className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-800/50">
                <h4 className="text-sm font-semibold text-zinc-300 mb-3 border-b border-zinc-700/50 pb-2">
                  Thông tin khách hàng
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-zinc-500 mb-1">Họ tên</div>
                    <div className="text-zinc-100 font-medium">
                      {order.User?.full_name || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-500 mb-1">Email</div>
                    <div className="text-zinc-100 font-medium">
                      {order.User?.email || "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin Suất chiếu */}
              <div className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-800/50">
                <h4 className="text-sm font-semibold text-zinc-300 mb-3 border-b border-zinc-700/50 pb-2">
                  Suất chiếu
                </h4>
                <div className="flex gap-4">
                  <div className="w-20 h-28 bg-zinc-800 rounded-lg overflow-hidden shrink-0 relative">
                    {order.showtime?.movie?.poster_url && (
                      <NextImage
                        src={order.showtime.movie.poster_url}
                        alt={order.showtime.movie.title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 space-y-2 text-sm text-zinc-300">
                    <p className="text-base font-bold text-white">
                      {order.showtime?.movie?.title}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-zinc-500" />{" "}
                      {order.showtime?.room?.cinema?.name} -{" "}
                      {order.showtime?.room?.name}
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-zinc-500" />{" "}
                      {order.showtime?.start_time && new Date(order.showtime.start_time).toLocaleDateString(
                        "vi-VN",
                      )}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-zinc-500" />{" "}
                      {order.showtime?.start_time && new Date(order.showtime.start_time).toLocaleTimeString(
                        "vi-VN",
                        { hour: "2-digit", minute: "2-digit" },
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Thanh toán */}
              <div className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-800/50">
                <h4 className="text-sm font-semibold text-zinc-300 mb-3 border-b border-zinc-700/50 pb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Thanh toán
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Tạm tính:</span>
                    <span className="text-zinc-100 font-medium">
                      {new Intl.NumberFormat("vi-VN").format(
                        order.original_amount,
                      )}
                      đ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Giảm giá (Voucher):</span>
                    <span className="text-red-400 font-medium">
                      -
                      {new Intl.NumberFormat("vi-VN").format(
                        order.discount_amount,
                      )}
                      đ
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-zinc-700/50 font-bold text-base">
                    <span className="text-white">Thành tiền:</span>
                    <span className="text-red-500">
                      {new Intl.NumberFormat("vi-VN").format(
                        order.final_amount,
                      )}
                      đ
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-red-500">
              Lỗi: Không tìm thấy đơn hàng
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
