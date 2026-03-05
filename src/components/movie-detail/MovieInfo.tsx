"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Movie {
  description: string;
  // Các field có thể mở rộng sau nếu API có trả về
  director?: string;
  language?: string;
  rated?: string;
}

const DUMMY_QA = [
  {
    question: "Bộ phim này có After Credit không?",
    answer:
      "Có 2 After Credit rất quan trọng ở cuối phim, bạn nhớ ngồi nán lại rạp để xem nhé!",
  },
  {
    question: "Điểm nhấn lớn nhất của phim là gì?",
    answer:
      "Bộ phim được quay 100% bằng máy quay IMAX tân tiến nhất, âm thanh đạt chuẩn Dolby Atmos mang lại trải nghiệm cực kì sống động.",
  },
  {
    question: "Phim có phù hợp với trẻ em không?",
    answer:
      "Phim được nắn mác 16+ do có một số cảnh hành động mạnh, phụ huynh nên cân nhắc trước khi dẫn trẻ theo.",
  },
];

export default function MovieInfo({
  movie,
  trivias = [],
  director = "Đang cập nhật",
  isLoadingExtra = false,
}: {
  movie: Movie;
  trivias?: { question: string; answer: string }[];
  director?: string;
  isLoadingExtra?: boolean;
}) {
  const [openQAIndex, setOpenQAIndex] = useState<number | null>(0);

  const toggleQA = (index: number) => {
    setOpenQAIndex(openQAIndex === index ? null : index);
  };

  const displayQA = trivias.length > 0 ? trivias : DUMMY_QA;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Cột trái: Tóm tắt */}
      <div className="col-span-1 lg:col-span-2 space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
          <h2 className="text-2xl font-black text-white uppercase">
            Tóm Tắt Nội Dung
          </h2>
        </div>
        <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
          {movie.description || "Nội dung phim đang được cập nhật..."}
        </p>

        {/* Q&A / Trivia Accordion */}
        <div className="mt-12 space-y-4">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            Bạn Có Biết?
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
              AI Generated
            </span>
          </h3>
          {isLoadingExtra ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[72px] bg-[#111] rounded-2xl w-full border border-white/10"
                ></div>
              ))}
            </div>
          ) : (
            displayQA.map((qa, index) => (
              <div
                key={index}
                className="border border-white/10 rounded-2xl bg-[#111] overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleQA(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  aria-expanded={openQAIndex === index}
                >
                  <span className="font-bold text-gray-200">{qa.question}</span>
                  <ChevronDown
                    className={`shrink-0 w-5 h-5 text-primary transition-transform duration-300 ${
                      openQAIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openQAIndex === index
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-3">
                    {qa.answer}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cột phải: Thông tin phụ (Đạo diễn, Ngôn ngữ, Độ tuổi) */}
      <div className="col-span-1">
        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 space-y-6 sticky top-24">
          <h3 className="text-xl font-black text-white uppercase mb-4 border-b border-white/10 pb-4">
            Thông Tin Chi Tiết
          </h3>

          <InfoRow label="Đạo Diễn" value={director || "Đang cập nhật"} />
          <InfoRow
            label="Ngôn Ngữ"
            value={movie.language || "Tiếng Anh - Phụ đề Tiếng Việt"}
          />
          <InfoRow
            label="Độ Tuổi"
            value={movie.rated || "T16 - Dành cho khán giả từ 16 tuổi"}
          />

          <div className="pt-4 mt-6 border-t border-white/10">
            <p className="text-xs text-gray-500 italic">
              * Lịch chiếu và thông tin có thể thay đổi mà không báo trước.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-gray-500">{label}</span>
      <span className="text-base font-bold text-gray-200">{value}</span>
    </div>
  );
}
