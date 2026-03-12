"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Bot,
  Sparkles,
  HelpCircle,
  Info,
  Tag,
  Layers,
  Pin,
  ChevronDown,
} from "lucide-react";
import { apiClient } from "@/lib/api";

type Tab = "features" | "pricing" | "faqs" | "about" | "";

interface FAQItem {
  question: string;
  answer: string;
}

export default function Footer() {
  const [activeTab, setActiveTab] = useState<Tab>("");
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);
  const [topFAQs, setTopFAQs] = useState<FAQItem[]>([
    {
      question: "Giá vé xem phim là bao nhiêu tiền?",
      answer: "Chào bạn. Hiện tại hệ thống BookingShow có 2 mức giá: Vé ghế Standard là 80.000 VNĐ. Vé ghế đôi VIP Sweetbox là 150.000 VNĐ.",
    },
  ]);
  // Fetch top FAQs kể cả khi chưa mở tab (preload)
  useEffect(() => {
    if (activeTab === "faqs") {
      apiClient
        .get<any, { success: boolean; data: FAQItem[] }>("/faq/top")
        .then((res) => {
          if (res.success && res.data && res.data.length > 0) {
            setTopFAQs(res.data);
          }
        })
        .catch(console.error);
    }
  }, [activeTab]);

  const toggleTab = (tab: Tab) => {
    setActiveTab(activeTab === tab ? "" : tab);
  };


  // NỘI DUNG CÁC TAB (TRỪ FAQs là chatbot)
  const renderTabContent = () => {
    switch (activeTab) {
      case "features":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <div className="bg-primary/20 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
                <Sparkles className="text-primary w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">
                Trải Nghiệm Đỉnh Cao
              </h4>
              <p className="text-sm leading-relaxed">
                BookingShow áp dụng công nghệ Rạp phim hiện đại chuẩn quốc tế
                IMAX và 4DX giúp bạn hòa mình trọn vẹn vào từng thước phim.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <div className="bg-blue-500/20 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
                <Bot className="text-blue-500 w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">
                Trợ Lý AI RAG Thông Minh
              </h4>
              <p className="text-sm leading-relaxed">
                Sử dụng AI tiên tiến nhất để gợi ý phim chuẩn xác theo sở thích
                và tư vấn giá vé, dịch vụ siêu tốc ngay lập tức.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <div className="bg-green-500/20 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
                <Tag className="text-green-500 w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">
                Thanh Toán Siêu Nhanh
              </h4>
              <p className="text-sm leading-relaxed">
                Tích hợp ví ZaloPay, PayOS xử lý giao dịch tự nhiên, duyệt mua
                lấy mã QR Code vào cổng ngay lập tức.
              </p>
            </div>
          </div>
        );
      case "pricing":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-b from-[#1a1c23] to-black p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center">
              <h4 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">
                Standard
              </h4>
              <p className="text-3xl font-black text-white mb-4">
                80.000
                <span className="text-sm text-gray-500 font-normal">đ</span>
              </p>
              <p className="text-sm text-gray-400 mb-6 flex-1">
                Vé phổ thông ghế đơn, màn hình 2D sắc nét.
              </p>
            </div>
            <div className="bg-gradient-to-b from-primary/20 to-[#1a1c23] p-6 rounded-2xl border border-primary/40 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-primary"></div>
              <h4 className="text-primary font-bold uppercase tracking-widest text-xs mb-2">
                VIP
              </h4>
              <p className="text-3xl font-black text-white mb-4">
                150.000
                <span className="text-sm text-gray-500 font-normal">đ</span>
              </p>
              <p className="text-sm text-gray-400 mb-6 flex-1">
                Ghế đôi (Sweetbox), màn hình cong góc rộng, tặng voucher bắp.
              </p>
            </div>
            <div className="bg-gradient-to-b from-[#1a1c23] to-black p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center">
              <h4 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">
                Combo Đồ Ăn
              </h4>
              <p className="text-3xl font-black text-white mb-4">
                Phụ phí ưu đãi
                <span className="text-sm text-gray-500 font-normal"></span>
              </p>
              <p className="text-sm text-gray-400 mb-6 flex-1">
                Giảm ngay 10% khi đặt trước Bắp và Nước ngọt trên website
                BookingShow.
              </p>
            </div>
          </div>
        );
      case "faqs":
        return (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/20 flex rounded-full items-center justify-center">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-black text-white">
                  Câu Hỏi Nhanh
                </h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Những thắc mắc phổ biến nhất được trả lời. Để trò chuyện trực tiếp với AI,
                hãy nhấn vào nút 🤖 ở góc dưới bên phải màn hình!
              </p>
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl p-3 text-sm text-primary font-medium">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Chatbot NOVA AI luôn sẵn sàng 24/7 phía dưới màn hình!</span>
              </div>
            </div>

            <div className="md:w-2/3">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase text-gray-600 tracking-wider flex items-center gap-1 mb-3">
                  <Pin className="w-3 h-3" /> Top câu hỏi phổ biến:
                </p>
                {topFAQs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="bg-white/5 border border-white/5 rounded-lg overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() =>
                        setExpandedFaqId(expandedFaqId === idx ? null : idx)
                      }
                      className="w-full flex items-center justify-between p-3 text-sm text-left hover:bg-white/5 text-gray-300 font-medium"
                    >
                      <span className="line-clamp-2 pr-4">{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform duration-300 shrink-0 ${expandedFaqId === idx ? "rotate-180" : ""}`}
                      />
                    </button>
                    <AnimatePresence>
                      {expandedFaqId === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="p-3 pt-1 text-sm text-gray-400 bg-white/5 rounded-b-lg whitespace-pre-wrap leading-relaxed border-t border-white/5">
                            {
                              faq.answer.replace(
                                /\[\d+\]\s*/g,
                                "",
                              )
                            }
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "about":
        return (
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/2">
              <h3 className="text-3xl font-black text-white mb-4">
                Về <span className="text-primary">BookingShow</span>
              </h3>
              <p className="text-gray-400 text-sm leading-loose mb-6">
                Được thành lập từ ý tưởng tạo ra nền tảng mua vé xem phim siêu
                tốc và ứng dụng công nghệ hiện đại. Cung cấp một ứng dụng Rạp
                phim All-in-one mượt mà với tính năng đề xuất phim cực chuẩn xác
                tích hợp trí tuệ nhân tạo. Hành trình ra rạp không chỉ đơn thuần
                là xem phim, mà là một trải nghiệm trọn vẹn.
              </p>
              <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-300">
                <span className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                  Hotline: 1900-1234
                </span>
                <span className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                  Email: support@bookingshow.vn
                </span>
              </div>
            </div>
            <div className="md:w-1/2 shrink-0">
              <img
                src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c"
                alt="About Cinema"
                className="w-full h-64 object-cover rounded-2xl shadow-2xl border border-white/10 grayscale hover:grayscale-0 transition duration-700"
                crossOrigin="anonymous"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <footer className="w-full bg-[#1c1d21] relative z-20">
      {/* KHU VỰC NỘI DUNG MỞ RỘNG (ACCORDION/TABS) */}
      <AnimatePresence>
        {activeTab && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full border-t border-primary/20 bg-[#16171a] overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
              <button
                onClick={() => setActiveTab("")}
                className="absolute top-4 right-4 sm:right-6 lg:right-8 bg-black/40 hover:bg-white/10 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
              {renderTabContent()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* THANH FOOTER CƠ BẢN */}
      <div className="w-full border-t border-gray-800 py-8 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left side: Copyright */}
          <div className="text-gray-500 text-sm md:w-1/3 text-center md:text-left flex items-center justify-center md:justify-start gap-2">
            &copy; 2025 BookingShow.
            <span className="hidden lg:inline text-xs">
              All Rights Reserved.
            </span>
          </div>

          {/* Middle: Logo text */}
          <div className="md:w-1/3 flex justify-center">
            <Link
              href="/"
              onClick={() => setActiveTab("")}
              className="text-2xl font-black text-white tracking-widest text-center hover:text-primary transition-colors"
            >
              BookingShow
            </Link>
          </div>

          {/* Right side: Interactive navigation links */}
          <nav className="flex items-center justify-center md:justify-end gap-2 lg:gap-4 md:w-1/3">
            <button
              onClick={() => toggleTab("features")}
              className={`text-sm font-semibold px-3 py-1.5 rounded-full transition-colors duration-300 flex items-center gap-1.5 ${
                activeTab === "features"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Features</span>
            </button>
            <button
              onClick={() => toggleTab("pricing")}
              className={`text-sm font-semibold px-3 py-1.5 rounded-full transition-colors duration-300 flex items-center gap-1.5 ${
                activeTab === "pricing"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pricing</span>
            </button>
            <button
              onClick={() => toggleTab("faqs")}
              className={`text-sm font-black px-3 py-1.5 rounded-full transition-all duration-300 flex items-center gap-1.5 ${
                activeTab === "faqs"
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-gray-400 hover:text-primary"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI FAQs</span>
            </button>
            <button
              onClick={() => toggleTab("about")}
              className={`text-sm font-semibold px-3 py-1.5 rounded-full transition-colors duration-300 flex items-center gap-1.5 ${
                activeTab === "about"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">About</span>
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
}
