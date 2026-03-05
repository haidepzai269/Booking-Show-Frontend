"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Tag } from "lucide-react";
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
  is_active: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  promotion: Promotion | null;
}

export default function PromotionFormModal({
  isOpen,
  onClose,
  onSuccess,
  promotion,
}: Props) {
  const [loading, setLoading] = useState(false);

  // Format datetime-local cho input
  const formatDatetimeLocal = (dateString: string) => {
    if (!dateString) return "";
    const dt = new Date(dateString);
    dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
    return dt.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_amount: "0",
    min_order_value: "0",
    valid_from: "",
    valid_until: "",
    usage_limit: "100",
    is_active: true,
  });

  useEffect(() => {
    if (promotion) {
      setFormData({
        code: promotion.code,
        description: promotion.description || "",
        discount_amount: promotion.discount_amount.toString(),
        min_order_value: promotion.min_order_value.toString(),
        valid_from: formatDatetimeLocal(promotion.valid_from),
        valid_until: formatDatetimeLocal(promotion.valid_until),
        usage_limit: promotion.usage_limit.toString(),
        is_active: promotion.is_active,
      });
    } else {
      setFormData({
        code: "",
        description: "",
        discount_amount: "",
        min_order_value: "0",
        valid_from: formatDatetimeLocal(new Date().toISOString()),
        valid_until: formatDatetimeLocal(
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        ),
        usage_limit: "100",
        is_active: true,
      });
    }
  }, [promotion, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        discount_amount: parseInt(formData.discount_amount),
        min_order_value: parseInt(formData.min_order_value),
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_until: new Date(formData.valid_until).toISOString(),
        usage_limit: parseInt(formData.usage_limit),
        ...(promotion && { is_active: formData.is_active }),
      };

      let res: { success: boolean; error?: string };
      if (promotion) {
        res = (await apiClient.put(
          `/admin/promotions/${promotion.id}`,
          payload,
        )) as typeof res;
      } else {
        res = (await apiClient.post(
          `/admin/promotions`,
          payload,
        )) as typeof res;
      }

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        alert("Lỗi: " + res.error);
      }
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl overflow-y-auto max-h-[90vh] shadow-2xl">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white flex gap-2 items-center">
            <Tag className="w-5 h-5 text-red-500" />
            {promotion ? "Chỉnh sửa Voucher" : "Tạo Voucher mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Mã Code (Tự động in hoa) *
              </label>
              <input
                required
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-500 transition font-mono uppercase font-bold"
                placeholder="VD: WELCOME2024"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Số lượt sử dụng tối đa *
              </label>
              <input
                required
                type="number"
                min="1"
                value={formData.usage_limit}
                onChange={(e) =>
                  setFormData({ ...formData, usage_limit: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Mô tả ngắn
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-500 transition"
                placeholder="VD: Giảm 50K cho thành viên mới..."
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Mức giảm (VNĐ) *
              </label>
              <input
                required
                type="number"
                min="0"
                value={formData.discount_amount}
                onChange={(e) =>
                  setFormData({ ...formData, discount_amount: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-500 transition text-red-400 font-bold"
                placeholder="VD: 50000"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Áp dụng cho đơn từ (VNĐ) *
              </label>
              <input
                required
                type="number"
                min="0"
                value={formData.min_order_value}
                onChange={(e) =>
                  setFormData({ ...formData, min_order_value: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Bắt đầu từ *
              </label>
              <input
                required
                type="datetime-local"
                value={formData.valid_from}
                onChange={(e) =>
                  setFormData({ ...formData, valid_from: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-500 transition [color-scheme:dark]"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Kết thúc vào *
              </label>
              <input
                required
                type="datetime-local"
                value={formData.valid_until}
                onChange={(e) =>
                  setFormData({ ...formData, valid_until: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-500 transition [color-scheme:dark]"
              />
            </div>

            {promotion && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Trạng thái (Khóa thủ công)
                </label>
                <select
                  value={formData.is_active ? "true" : "false"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_active: e.target.value === "true",
                    })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-500 transition"
                >
                  <option value="true">Đang kích hoạt</option>
                  <option value="false">Vô hiệu hóa</option>
                </select>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-zinc-300 hover:bg-zinc-800 rounded-lg transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-70"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {promotion ? "Lưu thay đổi" : "Tạo Voucher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
