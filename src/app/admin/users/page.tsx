"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Users, ShieldAlert } from "lucide-react";
import { apiClient } from "@/lib/api";

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const limit = 15;

  const [savingId, setSavingId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = (await apiClient.get(
        `/admin/users?page=${page}&limit=${limit}&q=${search}`,
      )) as { success: boolean; data: User[]; meta: { total: number } };
      if (res.success) {
        setUsers(res.data);
        setTotal(res.meta.total);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, search, limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (id: number, newRole: string) => {
    if (!confirm(`Bạn chắc chắn muốn đổi quyền user này thành ${newRole}?`))
      return;

    try {
      setSavingId(id);
      const res = (await apiClient.put(`/admin/users/${id}/role`, {
        role: newRole,
      })) as { success: boolean };
      if (res.success) {
        fetchUsers();
      } else {
        alert("Lỗi khi cập nhật quyền");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Lỗi khi cập nhật quyền");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
            Khách hàng & User
          </h1>
          <p className="text-zinc-400 mt-1">
            Quản lý tài khoản, thay đổi quyền truy cập
          </p>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Tìm theo email hoặc tên..."
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
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Cấp quyền (Role)</th>
                <th className="px-6 py-4">Ngày tham gia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-zinc-500"
                  >
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-zinc-500"
                  >
                    <Users className="w-8 h-8 opacity-50 mx-auto mb-2" />
                    Không tìm thấy user
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-zinc-500 font-mono">
                      #{u.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">
                        {u.full_name}
                      </div>
                      <div className="text-zinc-500 text-xs">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      <div className="flex items-center gap-2">
                        {u.role === "ADMIN" && (
                          <ShieldAlert className="w-4 h-4 text-red-500" />
                        )}
                        <select
                          disabled={savingId === u.id}
                          value={u.role}
                          onChange={(e) =>
                            handleRoleChange(u.id, e.target.value)
                          }
                          className={`bg-zinc-800 border ${u.role === "ADMIN" ? "border-red-500/50 text-red-400" : "border-zinc-700 text-white"} rounded px-2 py-1 text-xs focus:outline-none`}
                        >
                          <option value="CUSTOMER">CUSTOMER</option>
                          <option value="CINEMA_MANAGER">CINEMA_MANAGER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                        {savingId === u.id && (
                          <Loader2 className="w-3 h-3 animate-spin text-zinc-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {new Date(u.created_at).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-zinc-800 flex justify-between items-center text-sm text-zinc-400">
          <div>
            Hiển thị {users.length} / {total} user
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
