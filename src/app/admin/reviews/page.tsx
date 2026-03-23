"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { toast } from "react-hot-toast";
import { EyeOff, Eye, AlertTriangle, MessageSquare, Star, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface Review {
  id: number;
  movie_id: number;
  user_id: number;
  rating: number;
  content: string;
  likes_count: number;
  status: string;
  toxic_score: number;
  created_at: string;
  user: {
    id: number;
    full_name: string;
    email: string;
  };
  movie: {
    id: number;
    title: string;
  };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any>(`/admin/reviews?page=${page}&limit=20&status=${statusFilter}`);
      const data = res as any;
      setReviews(data.reviews || []);
      setTotal(data.total || 0);
    } catch (e) {
      toast.error("Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, statusFilter]);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await apiClient.put(`/admin/reviews/${id}/status`, { status });
      toast.success("Cập nhật trạng thái thành công");
      fetchReviews();
    } catch (err) {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  const handleDelete = async (id: number, movieId: number) => {
     if(!confirm("Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này?")) return;
     try {
         await apiClient.delete(`/movies/${movieId}/reviews/${id}`);
         toast.success("Đã xóa đánh giá");
         fetchReviews();
     } catch(err) {
         toast.error("Lỗi xóa");
     }
  }

  return (
    <div className="flex-1 min-h-screen">
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">Kiểm duyệt Đánh giá (AI)</h1>
          <p className="text-white/50 text-sm mt-1">Quản lý các bình luận đã được AI chấm điểm, phê duyệt hoặc ẩn đi</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm mb-6 flex justify-between items-center text-card-foreground">
           <div className="flex gap-2">
              <button 
                onClick={() => { setStatusFilter(""); setPage(1); }} 
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${statusFilter === "" ? "bg-primary text-white" : "text-gray-400 hover:bg-white/5"}`}
              >Tất cả</button>
              <button 
                onClick={() => { setStatusFilter("published"); setPage(1); }} 
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${statusFilter === "published" ? "bg-green-600 text-white" : "text-gray-400 hover:bg-white/5"}`}
              >Đã duyệt</button>
              <button 
                onClick={() => { setStatusFilter("hidden"); setPage(1); }} 
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${statusFilter === "hidden" ? "bg-red-600/80 text-white" : "text-gray-400 hover:bg-white/5"}`}
              ><EyeOff className="w-4 h-4" /> Bị ẩn/Toxic</button>
           </div>
           
           <div className="text-gray-400 text-sm font-medium">
              Trang {page} / Tổng {total} đánh giá
           </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-secondary/50 border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                       <th className="px-6 py-4 font-bold">Người dùng</th>
                       <th className="px-6 py-4 font-bold">Phim</th>
                       <th className="px-6 py-4 font-bold">Nội dung</th>
                       <th className="px-6 py-4 font-bold">AI Toxic Score</th>
                       <th className="px-6 py-4 font-bold">Trạng thái</th>
                       <th className="px-6 py-4 font-bold text-right">Thao tác</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border/50">
                    {loading ? (
                       <tr><td colSpan={6} className="text-center py-12"><div className="w-6 h-6 border-2 border-t-primary rounded-full animate-spin mx-auto"></div></td></tr>
                    ) : reviews.length === 0 ? (
                       <tr><td colSpan={6} className="text-center py-16 text-muted-foreground">
                           <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-700" />
                           Không tìm thấy đánh giá nào
                       </td></tr>
                    ) : (
                       reviews.map(r => {
                          const isHighToxic = r.toxic_score >= 0.8;
                          const isWarning = r.toxic_score >= 0.5 && r.toxic_score < 0.8;
                          return (
                          <tr key={r.id} className={`transition-colors hover:bg-white/5 group ${isHighToxic && r.status === 'published' ? 'bg-red-900/10 hover:bg-red-900/20' : ''}`}>
                             <td className="px-6 py-4 align-top">
                                <p className="text-white font-medium text-sm">{r.user?.full_name}</p>
                                <p className="text-gray-500 text-xs mt-1">{r.user?.email}</p>
                             </td>
                             <td className="px-6 py-4 align-top">
                                <p className="text-white text-sm font-bold line-clamp-2">{r.movie?.title}</p>
                                <div className="flex gap-1 mt-2 text-yellow-500">
                                   {[1,2,3,4,5].map(i => <Star key={i} className={`w-3 h-3 ${i <= r.rating ? "fill-current" : "text-gray-600"}`} />)}
                                </div>
                             </td>
                             <td className="px-6 py-4 align-top max-w-sm">
                                <p className="text-gray-300 text-[13px] whitespace-pre-wrap">{r.content}</p>
                                <p className="text-gray-500 text-[11px] mt-2 capitalize">{format(new Date(r.created_at), "dd/MM/yyyy HH:mm")}</p>
                             </td>
                             <td className="px-6 py-4 align-top">
                                <div className={`inline-flex items-center justify-center min-w-[65px] gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-inner ${isHighToxic ? "bg-red-500/20 text-red-400 border-red-500/30" : isWarning ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" : "bg-green-500/10 text-green-500 border-green-500/20"}`}>
                                   {isHighToxic && <AlertTriangle className="w-3.5 h-3.5" />}
                                   {(r.toxic_score * 100).toFixed(1)}%
                                </div>
                             </td>
                             <td className="px-6 py-4 align-top">
                                <span className={`inline-flex px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${r.status === 'published' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-secondary text-gray-400 border border-white/5 shadow-inner'}`}>
                                   {r.status === 'published' ? 'Đã duyệt' : 'Đã ẩn'}
                                </span>
                             </td>
                             <td className="px-6 py-4 text-right align-top">
                                <div className="flex flex-col items-end gap-2">
                                   {r.status === 'published' ? (
                                      <button onClick={() => handleUpdateStatus(r.id, 'hidden')} className="px-3 py-1.5 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-400 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-yellow-500/20 shadow-sm">
                                         <EyeOff className="w-3.5 h-3.5" /> Ẩn bình luận
                                      </button>
                                   ) : (
                                      <button onClick={() => handleUpdateStatus(r.id, 'published')} className="px-3 py-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-400 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-green-500/20 shadow-sm">
                                         <Eye className="w-3.5 h-3.5" /> Khôi phục
                                      </button>
                                   )}
                                   <button onClick={() => handleDelete(r.id, r.movie_id)} className="w-full flex justify-center px-3 py-1.5 text-gray-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 rounded-lg transition-colors border border-transparent shadow-sm">
                                      <Trash2 className="w-3.5 h-3.5" />
                                   </button>
                                </div>
                             </td>
                          </tr>
                          )
                       })
                    )}
                 </tbody>
              </table>
           </div>
           
           <div className="flex justify-between items-center p-5 border-t border-border bg-black/20">
              <button disabled={page === 1} onClick={() => setPage(page-1)} className="px-5 py-2.5 bg-secondary text-white text-sm font-medium rounded-xl hover:bg-white/10 disabled:opacity-50 transition-colors shadow-sm">Trang trước</button>
              <button disabled={reviews.length < 20} onClick={() => setPage(page+1)} className="px-5 py-2.5 bg-secondary text-white text-sm font-medium rounded-xl hover:bg-white/10 disabled:opacity-50 transition-colors shadow-sm">Trang sau</button>
           </div>
        </div>
      </div>
    </div>
  );
}
