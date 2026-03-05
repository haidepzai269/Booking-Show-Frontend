import MovieForm from "@/components/admin/movies/MovieForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Tạo phim mới - Admin" };

export default function CreateMoviePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/movies"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Tạo phim mới</h1>
          <p className="text-white/40 text-sm mt-0.5">Thêm phim vào hệ thống</p>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
        <MovieForm mode="create" />
      </div>
    </div>
  );
}
