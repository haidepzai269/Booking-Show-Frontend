"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, Armchair, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api";

interface Room {
  id: number;
  name: string;
  capacity: number;
  is_active: boolean;
}

export default function RoomPanel({ cinemaId }: { cinemaId: number }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: "", capacity: "" });

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = (await apiClient.get(`/admin/cinemas/${cinemaId}/rooms`)) as {
        success: boolean;
        data: Room[];
      };
      if (res.success) {
        setRooms(res.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [cinemaId]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.name || !newRoom.capacity) return;

    setCreating(true);
    try {
      const res = (await apiClient.post(`/admin/cinemas/${cinemaId}/rooms`, {
        name: newRoom.name,
        capacity: parseInt(newRoom.capacity),
      })) as { success: boolean; error?: string };

      if (res.success) {
        setNewRoom({ name: "", capacity: "" });
        fetchRooms();
      } else {
        alert("Lỗi: " + res.error);
      }
    } catch (error) {
      console.error(error);
      alert("Không tạo được phòng");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRoom = async (id: number) => {
    if (!confirm("Xóa phòng sẽ ảnh hưởng các suất chiếu. Tiếp tục?")) return;

    try {
      await apiClient.delete(`/admin/rooms/${id}`);
      fetchRooms();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-start gap-8">
        {/* Danh sách phòng hiện có */}
        <div className="flex-1">
          <h4 className="font-semibold text-zinc-300 mb-4 flex items-center gap-2">
            <Armchair className="w-4 h-4 text-red-500" />
            Phòng chiếu ({rooms.length})
          </h4>

          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="bg-zinc-800/50 rounded-lg p-6 text-center text-zinc-500 text-sm">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Chưa có phòng chiếu nào
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-zinc-800/80 border border-zinc-700/50 rounded-lg p-4 group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-zinc-200">
                      {room.name}
                    </span>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm text-zinc-400">
                    Sức chứa:{" "}
                    <span className="text-zinc-300">{room.capacity}</span> ghế
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form thêm phòng */}
        <div className="w-80 bg-zinc-950 border border-zinc-800 rounded-xl p-5 shrink-0">
          <h4 className="font-medium text-zinc-300 mb-4 text-sm">
            Thêm phòng mới
          </h4>
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div>
              <input
                type="text"
                required
                placeholder="Tên phòng (VD: Rạp 1)"
                value={newRoom.name}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, name: e.target.value })
                }
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 transition"
              />
            </div>
            <div>
              <input
                type="number"
                required
                min="10"
                max="500"
                placeholder="Sức chứa (số ghế)"
                value={newRoom.capacity}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, capacity: e.target.value })
                }
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 transition"
              />
              <p className="text-xs text-zinc-500 mt-1.5">
                Ghế sẽ được tự động sinh theo lưới
              </p>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium py-2 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {creating ? "Đang tạo..." : "Khởi tạo phòng"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
