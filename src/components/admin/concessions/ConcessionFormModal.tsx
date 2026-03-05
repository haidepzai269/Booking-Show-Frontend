"use client";

import { useState, useEffect } from "react";
import { X, Upload, Loader2, Popcorn } from "lucide-react";
import { apiClient } from "@/lib/api";

interface Concession {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_active: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  concession: Concession | null;
}

export default function ConcessionFormModal({
  isOpen,
  onClose,
  onSuccess,
  concession,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    is_active: true,
  });

  useEffect(() => {
    if (concession) {
      setFormData({
        name: concession.name,
        description: concession.description || "",
        price: concession.price.toString(),
        image_url: concession.image_url || "",
        is_active: concession.is_active,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        image_url: "",
        is_active: true,
      });
    }
  }, [concession, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formUpload = new FormData();
    formUpload.append("file", file);

    try {
      // Upload file dùng axios với multipart
      const res = (await apiClient.post("/admin/upload", formUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      } as unknown as Record<string, unknown>)) as {
        success: boolean;
        data: { url: string };
        error?: string;
      };
      if (res.success) {
        setFormData((prev) => ({ ...prev, image_url: res.data.url }));
      } else {
        alert("Upload failed: " + res.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload thất bại!");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseInt(formData.price),
        image_url: formData.image_url,
        ...(concession && { is_active: formData.is_active }),
      };

      let res: { success: boolean; error?: string };
      if (concession) {
        res = (await apiClient.put(
          `/admin/concessions/${concession.id}`,
          payload,
        )) as typeof res;
      } else {
        res = (await apiClient.post(
          `/admin/concessions`,
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
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
          <h2 className="text-xl font-bold text-white flex gap-2 items-center">
            <Popcorn className="w-5 h-5 text-yellow-500" />
            {concession ? "Chỉnh sửa sản phẩm" : "Thêm combo / đồ ăn mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Ảnh sản phẩm
            </label>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                {formData.image_url ? (
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Popcorn className="w-8 h-8 text-zinc-600" />
                )}
              </div>
              <div className="space-y-3 flex-1">
                <label className="cursor-pointer inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-4 py-2 rounded-lg text-sm transition text-white">
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {uploading ? "Đang tải lên..." : "Tải ảnh lên"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
                <p className="text-xs text-zinc-500">
                  Hỗ trợ JPG, PNG (tốt nhất là nền trong suốt). Tỉ lệ 1:1.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Tên sản phẩm *
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-500 transition"
                placeholder="VD: Combo Bắp Nước Siêu To"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Giá bán (VNĐ) *
              </label>
              <input
                required
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-500 transition"
                placeholder="VD: 95000"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Mô tả (các món trong combo)
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-500 transition resize-none"
                placeholder="VD: 1 Bắp bơ lớn + 2 Nước ngọt size L..."
              />
            </div>

            {concession && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Trạng thái bán
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
                  <option value="true">Đang bán</option>
                  <option value="false">Tạm ngưng / Hết hàng</option>
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
              disabled={loading || uploading}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-70"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {concession ? "Lưu thay đổi" : "Tạo sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
