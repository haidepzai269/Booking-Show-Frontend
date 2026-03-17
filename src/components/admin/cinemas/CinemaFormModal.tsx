"use client";

import { useState, useEffect } from "react";
import { X, Upload, Loader2, Building2 } from "lucide-react";
import NextImage from "next/image";
import { apiClient } from "@/lib/api";

interface Cinema {
  id: number;
  name: string;
  address: string;
  city: string;
  image_url: string;
  is_active: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cinema: Cinema | null;
}

export default function CinemaFormModal({
  isOpen,
  onClose,
  onSuccess,
  cinema,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    image_url: "",
    is_active: true,
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    if (cinema) {
      setFormData({
        name: cinema.name,
        address: cinema.address,
        city: cinema.city || "Hồ Chí Minh",
        image_url: cinema.image_url || "",
        is_active: cinema.is_active,
        latitude: cinema.latitude != null ? String(cinema.latitude) : "",
        longitude: cinema.longitude != null ? String(cinema.longitude) : "",
      });
    } else {
      setFormData({
        name: "",
        address: "",
        city: "Hồ Chí Minh",
        image_url: "",
        is_active: true,
        latitude: "",
        longitude: "",
      });
    }
  }, [cinema, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = (await apiClient.post("/admin/upload", formData, {
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
      alert("Upload failed!");
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
        address: formData.address,
        city: formData.city,
        image_url: formData.image_url,
        latitude:
          formData.latitude !== "" ? parseFloat(formData.latitude) : null,
        longitude:
          formData.longitude !== "" ? parseFloat(formData.longitude) : null,
        ...(cinema && { is_active: formData.is_active }),
      };

      let res: { success: boolean; error?: string };
      if (cinema) {
        res = (await apiClient.put(
          `/admin/cinemas/${cinema.id}`,
          payload,
        )) as typeof res;
      } else {
        res = (await apiClient.post(`/admin/cinemas`, payload)) as typeof res;
      }

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        alert("Lỗi: " + res.error);
      }
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center sticky top-0 bg-zinc-900 z-10">
          <h2 className="text-xl font-bold text-white flex gap-2 items-center">
            <Building2 className="w-5 h-5 text-red-500" />
            {cinema ? "Chỉnh sửa rạp" : "Thêm rạp mới"}
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
              Ảnh đại diện rạp
            </label>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0 relative">
                {formData.image_url ? (
                  <NextImage
                    src={formData.image_url}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-zinc-600" />
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
                  Hỗ trợ JPG, PNG. Tỉ lệ khuyến nghị 1:1 hoặc 4:3.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Tên rạp
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-500 transition"
                placeholder="VD: CGV Landmark 81"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Địa chỉ
              </label>
              <input
                required
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-500 transition"
                placeholder="Số nhà, tên đường..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Thành phố
              </label>
              <select
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-500 transition"
              >
                <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Cần Thơ">Cần Thơ</option>
                <option value="Hải Phòng">Hải Phòng</option>
                <option value="Bình Dương">Bình Dương</option>
                <option value="Đồng Nai">Đồng Nai</option>
              </select>
            </div>

            {cinema && (
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Trạng thái
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
                  <option value="true">Hoạt động</option>
                  <option value="false">Tạm ngưng</option>
                </select>
              </div>
            )}
          </div>

          {/* Tọa độ địa lý */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-zinc-400">
                Tọa độ địa lý
                <span className="text-zinc-600 font-normal ml-1">
                  (tùy chọn)
                </span>
              </label>
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(formData.address || formData.name || "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 underline transition"
              >
                Tìm tọa độ trên Google Maps ↗
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">
                  Vĩ độ (Latitude)
                </label>
                <input
                  type="number"
                  step="0.0000001"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: e.target.value })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition text-sm"
                  placeholder="VD: 10.7769"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">
                  Kinh độ (Longitude)
                </label>
                <input
                  type="number"
                  step="0.0000001"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: e.target.value })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition text-sm"
                  placeholder="VD: 106.7009"
                />
              </div>
            </div>
            <p className="text-xs text-zinc-600 mt-1.5">
              Nhập tọa độ để hỗ trợ tính năng "Tìm rạp gần bạn nhất" cho người
              dùng.
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-zinc-900 border-t border-zinc-800 p-4 -mx-6 -mb-6 mt-6">
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
              {cinema ? "Lưu thay đổi" : "Tạo rạp mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
