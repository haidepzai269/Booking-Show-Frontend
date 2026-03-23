"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { toast } from "react-hot-toast";
import { Trash2, Plus, ShieldBan } from "lucide-react";

interface BlacklistedWord {
  id: number;
  word: string;
  created_at: string;
}

export default function BlacklistedWordsPage() {
  const [words, setWords] = useState<BlacklistedWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWord, setNewWord] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchWords = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any>("/admin/blacklisted-words");
      setWords((res as any) || []);
    } catch (e) {
      toast.error("Không thể tải danh sách từ cấm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWords();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    try {
      setSubmitting(true);
      await apiClient.post("/admin/blacklisted-words", { word: newWord.trim() });
      toast.success("Đã thêm từ cấm");
      setNewWord("");
      fetchWords();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Lỗi thêm từ cấm");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa từ cấm này?")) return;
    try {
      await apiClient.delete(`/admin/blacklisted-words/${id}`);
      toast.success("Đã xóa");
      fetchWords();
    } catch (err) {
      toast.error("Lỗi xóa từ cấm");
    }
  };

  return (
    <div className="flex-1 min-h-screen">
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">Quản lý Từ ngữ cấm</h1>
          <p className="text-white/50 text-sm mt-1">Hệ thống chốt chặn Lớp 1 - Từ chối lưu vào Database khi phát hiện vi phạm</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-6 max-w-2xl text-card-foreground">
           <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                 <label className="text-white text-sm font-medium mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                       <ShieldBan className="w-4 h-4 text-red-500" />
                    </div>
                    Thêm từ khóa lóng/tục tĩu cần chặn
                 </label>
                 <input 
                    type="text" 
                    value={newWord} 
                    onChange={e => setNewWord(e.target.value)}
                    placeholder="Nhập từ khóa (ví dụ: cmn, ml...)"
                    className="w-full bg-background border border-border text-white rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner"
                 />
              </div>
              <button disabled={submitting || !newWord.trim()} type="submit" className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-50 shadow-[0_4px_14px_0_rgba(229,9,20,0.39)] hover:shadow-[0_6px_20px_rgba(229,9,20,0.23)] w-full sm:w-auto h-[50px]">
                 <Plus className="w-5 h-5" /> Thêm nhanh
              </button>
           </form>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm max-w-4xl">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-secondary/50 border-b border-border text-muted-foreground text-xs tracking-wider">
                    <th className="px-6 py-4 font-bold uppercase min-w-[300px]">Từ khóa bị cấm</th>
                    <th className="px-6 py-4 font-bold uppercase w-80">Ngày tạo</th>
                    <th className="px-6 py-4 font-bold uppercase text-right">Thao tác</th>
                 </tr>
              </thead>
              <tbody>
                 {loading ? (
                    <tr><td colSpan={3} className="text-center py-8 text-gray-500">
                        <div className="flex justify-center"><div className="w-6 h-6 border-2 border-t-primary rounded-full animate-spin"></div></div>
                    </td></tr>
                 ) : words.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-12 text-gray-500">
                        <ShieldBan className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                        Chưa có từ cấm nào được thiết lập.
                    </td></tr>
                 ) : (
                    words.map(w => (
                       <tr key={w.id} className="border-b border-border/50 hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4">
                             <div className="bg-red-500/10 border border-red-500/20 text-red-400 font-medium px-3 py-1 rounded-md inline-block">
                                {w.word}
                             </div>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm font-medium">{new Date(w.created_at).toLocaleString('vi-VN')}</td>
                          <td className="px-6 py-4 text-right">
                             <button onClick={() => handleDelete(w.id)} className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>
                          </td>
                       </tr>
                    ))
                 )}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
