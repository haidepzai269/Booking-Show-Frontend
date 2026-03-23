"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Star, ThumbsUp, Trash2, Send, Filter, CheckCircle2, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

interface Review {
  id: number;
  movie_id: number;
  user_id: number;
  rating: number;
  content: string;
  likes_count: number;
  status: string;
  created_at: string;
  user: {
    id: number;
    full_name: string;
  };
}

interface RatingStats {
  total_reviews: number;
  average_rating: number;
  rating_counts: Record<number, number>;
}

export default function MovieReviews({ movieId }: { movieId: number }) {
  const { user } = useAuthStore();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  
  const [filterRating, setFilterRating] = useState<number>(0);
  const [sort, setSort] = useState<string>("popular");
  
  const [loading, setLoading] = useState(true);
  
  const [newRating, setNewRating] = useState(5);
  const [newContent, setNewContent] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [rejectedReviewIds, setRejectedReviewIds] = useState<Set<number>>(new Set());

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any>(`/movies/${movieId}/reviews?sort=${sort}&rating=${filterRating}&limit=20`);
      const data = res as any;
      setReviews(data.reviews || []);
      setStats(data.stats || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();

    // Khởi tạo kênh nhận Realtime Review (Server-Sent Events)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const eventSource = new EventSource(`${apiUrl}/movies/${movieId}/reviews/stream`);
    
    eventSource.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        
        if (payload.action === "CREATED") {
            const newReview = payload.data;
            setReviews(prev => {
               if (prev.some(r => r.id === newReview.id)) return prev;
               return [newReview, ...prev];
            });
            setStats(prev => prev ? {
                ...prev,
                total_reviews: prev.total_reviews + 1,
                rating_counts: {
                    ...prev.rating_counts,
                    [newReview.rating]: (prev.rating_counts[newReview.rating] || 0) + 1
                }
            } : null);
        } else if (payload.action === "DELETED") {
            setReviews(prev => prev.filter(r => r.id !== payload.review_id));
        } else if (payload.action === "REJECTED") {
            if (payload.user_id === useAuthStore.getState().user?.id) {
               toast.error(`Bình luận vi phạm tiêu chuẩn cộng đồng! Đây là cảnh cáo lần ${payload.strike_count} dành cho bạn.`, { duration: 10000 });
            }
            setRejectedReviewIds(prev => new Set(prev).add(payload.review_id));
            setTimeout(() => {
                setReviews(prev => prev.filter(r => r.id !== payload.review_id));
            }, 3000);
        } else if (payload.id && !payload.action) {
            // Hỗ trợ Code cũ chưa refresh lại Backend
            const newReview = payload;
            setReviews(prev => {
               if (prev.some(r => r.id === newReview.id)) return prev;
               return [newReview, ...prev];
            });
        }
      } catch (err) {
        console.error("SSE Parse Error:", err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [movieId, sort, filterRating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Vui lòng đăng nhập để đánh giá");
      return;
    }
    if (!newContent.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá");
      return;
    }

    setSubmitLoading(true);
    try {
      await apiClient.post(`/movies/${movieId}/reviews`, {
        rating: newRating,
        content: newContent
      });
      toast.success("Gửi đánh giá thành công!");
      setNewContent("");
      setNewRating(5);
      fetchReviews();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Lỗi hệ thống");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return;
    try {
      await apiClient.delete(`/movies/${movieId}/reviews/${reviewId}`);
      toast.success("Đã xóa đánh giá");
      fetchReviews();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Lỗi xóa đánh giá");
    }
  };

  const handleLike = async (reviewId: number) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thích đánh giá");
      return;
    }
    try {
      await apiClient.post(`/movies/${movieId}/reviews/${reviewId}/like`, {});
      fetchReviews();
    } catch (e) {
      toast.error("Có lỗi xảy ra");
    }
  };

  return (
    <div id="reviews" className="scroll-mt-32 space-y-8 mt-12 mb-20">
      <h2 className="text-2xl font-black text-white uppercase border-l-4 border-primary pl-4">
        Đánh Giá & Nhận Xét
      </h2>

      {/* Stats Summary */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl flex flex-col md:flex-row gap-8 items-center md:items-start shadow-2xl relative overflow-hidden group">
        {/* Glow effect */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-primary/30 transition-colors duration-700" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col items-center justify-center md:w-1/3 z-10 py-4">
          <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-lg tracking-tighter">
            {stats?.average_rating ? stats.average_rating.toFixed(1) : "0.0"}
          </span>
          <div className="flex text-yellow-500 mt-3 mix-blend-screen drop-shadow-[0_0_10px_rgba(234,179,8,0.4)] gap-1">
             {[1,2,3,4,5].map(i => <Star key={i} className={`w-5 h-5 ${i <= Math.round(stats?.average_rating || 0) ? "fill-current" : "text-white/20"}`} />)}
          </div>
          <span className="text-white/50 mt-2 font-medium text-sm tracking-wide">trên 5 sao</span>
          <button 
            type="button"
            onClick={() => document.getElementById('reviews-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="mt-6 text-primary font-black bg-primary/10 hover:bg-primary hover:text-white hover:scale-105 active:scale-95 px-6 py-2 rounded-full text-sm border border-primary/20 shadow-[0_0_15px_rgba(229,9,20,0.15)] transition-all duration-300 flex items-center gap-2 group-hover:border-primary/40 cursor-pointer"
          >
            {stats?.total_reviews || 0} đánh giá
          </button>
        </div>
        
        <div className="flex-1 w-full space-y-4 z-10 pt-2 border-t border-white/5 md:border-t-0 md:border-l md:border-white/5 md:pl-8">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats?.rating_counts?.[star] || 0;
            const total = stats?.total_reviews || 1;
            const percent = stats?.total_reviews ? (count / stats.total_reviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-4 w-full group/bar cursor-pointer" onClick={() => setFilterRating(star)}>
                <span className="w-12 text-sm text-white/50 font-bold flex items-center justify-end gap-1.5 group-hover/bar:text-white transition-colors">
                  {star} <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]"/>
                </span>
                <div className="flex-1 h-3.5 bg-black/50 rounded-full overflow-hidden shadow-inner border border-white/5 backdrop-blur-sm relative">
                  <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(229,9,20,0.6)]" style={{ width: `${percent}%` }} />
                </div>
                <span className="w-10 text-sm text-white/50 text-left font-bold group-hover/bar:text-white transition-colors tabular-nums">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Submission */}
      <form onSubmit={handleSubmit} className="bg-card border border-border p-6 rounded-2xl relative shadow-lg overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {!user && (
           <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/5">
             <div className="bg-card p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center">
               <MessageSquare className="w-10 h-10 text-primary mb-3" />
               <p className="text-white font-bold text-lg mb-1">Tham gia thảo luận</p>
               <p className="text-muted-foreground text-sm text-center">Vui lòng đăng nhập để chia sẻ cảm nhận<br/>của bạn về bộ phim này.</p>
             </div>
           </div>
        )}
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
           <MessageSquare className="w-4 h-4 text-primary" /> Gửi đánh giá của bạn
        </h3>
        <div className="flex gap-2 mb-5 bg-background inline-flex p-2 rounded-xl border border-border">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setNewRating(s)}
              className="focus:outline-none transition-transform hover:scale-110 p-1"
            >
              <Star className={`w-8 h-8 ${newRating >= s ? "text-yellow-500 fill-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" : "text-gray-600"} transition-colors`} />
            </button>
          ))}
        </div>
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Hãy chia sẻ cảm nhận chân thật của bạn về bộ phim..."
          className="w-full bg-background border border-border rounded-xl p-4 text-white placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none h-32 mb-4 transition-all shadow-inner"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitLoading || !newContent.trim()}
            className="bg-primary hover:bg-primary/90 text-white font-black py-2.5 px-8 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(229,9,20,0.39)] hover:shadow-[0_6px_20px_rgba(229,9,20,0.23)] hover:-translate-y-0.5"
          >
            {submitLoading ? <span className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full"></span> : <Send className="w-4 h-4" />}
            Đăng Bình Luận
          </button>
        </div>
      </form>

      {/* Filter & Sort Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-3 rounded-2xl border border-border shadow-md">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto p-1 hide-scroll">
          <Filter className="w-4 h-4 text-muted-foreground ml-2 mr-1 shrink-0" />
          <button onClick={() => setFilterRating(0)} className={`whitespace-nowrap px-5 py-2 rounded-xl text-sm font-bold transition-all ${filterRating === 0 ? "bg-primary text-white shadow-md" : "bg-transparent text-muted-foreground hover:bg-secondary hover:text-white"}`}>Tất cả</button>
          {[5, 4, 3, 2, 1].map(r => (
            <button key={r} onClick={() => setFilterRating(r)} className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${filterRating === r ? "bg-white/10 text-white border border-white/20 shadow-md" : "bg-transparent text-muted-foreground hover:bg-secondary hover:text-white border border-transparent"}`}>
               {r} <Star className={`w-3.5 h-3.5 ${filterRating === r ? "fill-yellow-500 text-yellow-500" : "fill-current"}`} />
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-background border border-border text-white text-sm font-medium rounded-xl focus:ring-primary focus:border-primary block p-2.5 outline-none md:w-48 w-full cursor-pointer hover:border-white/20 transition-colors"
        >
          <option value="popular">Hữu ích nhất</option>
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>
      </div>

      {/* Reviews List */}
      <div id="reviews-list" className="relative mt-8 p-[2px] rounded-[24px] overflow-hidden group/laser shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
        {/* Animated Laser Border */}
        <div className="absolute inset-[-100%] animate-spin opacity-50 group-hover/laser:opacity-100 transition-opacity duration-500"
             style={{ animationDuration: '4s', background: 'conic-gradient(from 0deg, transparent 70%, rgba(229, 9, 20, 1) 100%)' }} />
             
        {/* Inner Content Container */}
        <div className="relative rounded-[22px] overflow-hidden border border-white/5 bg-[#0a0a0a]/90 backdrop-blur-2xl w-full h-full">
          {/* Subtle glow behind */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-black/90 pointer-events-none" />
          
          <div className="h-[600px] overflow-y-auto p-4 sm:p-6 relative z-10 flex flex-col gap-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20 transition-all">
          {loading ? (
            <div className="flex h-full items-center justify-center">
                 <div className="flex flex-col items-center gap-4">
                     <div className="w-10 h-10 border-4 border-t-primary border-primary/20 rounded-full animate-spin"></div>
                     <p className="text-white/50 font-medium animate-pulse">Đang kết nối luồng đánh giá...</p>
                 </div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex h-full items-center justify-center flex-col relative opacity-50">
                <MessageSquare className="w-16 h-16 text-white/20 mb-4" />
                <p className="text-white text-lg font-bold">Chưa có đánh giá nào</p>
                <p className="text-white/60 text-sm mt-1">Trở thành người đầu tiên mở bát nhé!</p>
            </div>
          ) : (
            reviews.map((review) => {
              const isRejected = rejectedReviewIds.has(review.id);
              return (
              <div key={review.id} className={`hover:bg-white/5 p-4 rounded-xl transition-all relative group flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-500 ${isRejected ? 'opacity-30 grayscale pointer-events-none transition-all duration-[3000ms] border border-red-500/50 bg-red-900/10' : ''}`}>
                {isRejected && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/60 rounded-xl backdrop-blur-sm animate-pulse">
                     <div className="w-12 h-12 flex items-center justify-center border-[3px] border-red-500 rounded-full mb-1">
                         <span className="text-red-500 font-black text-3xl">!</span>
                     </div>
                     <span className="text-red-500 font-bold text-lg uppercase tracking-widest px-3 py-1 bg-black/80 border border-red-500/50 rounded-lg">Bị AI Gỡ Bỏ</span>
                  </div>
                )}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-primary/20 border border-primary/30 flex items-center justify-center text-white font-black shadow-[0_0_10px_rgba(229,9,20,0.2)] shrink-0 mt-1">
                  {review.user?.full_name?.charAt(0) || "U"}
                </div>
                <div className="flex-1 w-full min-w-0">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 truncate">
                      <h4 className="text-white/90 font-bold text-[14px] flex items-center gap-2 truncate">
                        <span className="truncate">{review.user?.full_name}</span>
                        <span className="text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border border-green-400/20 shrink-0">
                           Đã mua vé
                        </span>
                      </h4>
                      <span className="text-white/30 text-[11px] font-medium hidden sm:inline-block shrink-0">• {format(new Date(review.created_at), "dd/MM HH:mm")}</span>
                    </div>
                    {user?.id === review.user_id && (
                       <button onClick={() => handleDelete(review.id)} className="text-white/20 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 shrink-0" title="Xóa đánh giá">
                          <Trash2 className="w-3.5 h-3.5" />
                       </button>
                    )}
                  </div>
                  <div className="flex drop-shadow-[0_0_2px_rgba(234,179,8,0.5)] mb-2">
                      {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`w-3 h-3 ${i <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-white/10"}`} />
                      ))}
                  </div>
                  <p className="text-white/80 text-[14px] leading-relaxed mb-3 whitespace-pre-line break-words">
                     {review.content}
                  </p>
                  <button onClick={() => handleLike(review.id)} className="flex items-center gap-1.5 text-[11px] font-bold text-white/30 hover:text-white transition-colors">
                      <ThumbsUp className={`w-3.5 h-3.5 ${review.likes_count > 0 ? "text-primary" : ""}`} /> Hữu ích <span className={`${review.likes_count > 0 ? "text-primary" : ""}`}>{review.likes_count > 0 ? review.likes_count : ""}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
        </div>
        
        {/* Gradient mờ ảo dần ở hai đầu để tạo cảm giác vô cực */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-20" />
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/90 to-transparent pointer-events-none z-20" />
        </div>
      </div>
    </div>
  );
}
