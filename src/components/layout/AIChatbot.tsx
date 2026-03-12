"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Pin,
  ChevronDown,
  Zap,
  MessageSquare,
  RefreshCw,
  Minimize2,
} from "lucide-react";
import { apiClient } from "@/lib/api";

interface ChatMessage {
  id: string;
  role: "system" | "user" | "ai";
  content: string;
  fromCache?: boolean;
  timestamp: Date;
}

interface FAQItem {
  question: string;
  answer: string;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "system",
  content:
    "Xin chào! 👋 Mình là **NOVA** — Trợ lý AI thông minh của **BookingShow**!\n\nMình có thể giúp bạn:\n• 🎬 Tìm phim đang chiếu\n• 💰 Tư vấn giá vé & combo\n• 🎫 Hướng dẫn đặt vé\n• ❓ Giải đáp mọi thắc mắc",
  timestamp: new Date(),
};

const QUICK_QUESTIONS = [
  "Giá vé xem phim là bao nhiêu?",
  "Làm sao để đặt vé online?",
  "Có phim gì đang chiếu không?",
];

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [question, setQuestion] = useState("");
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);
  const [topFAQs, setTopFAQs] = useState<FAQItem[]>([]);
  const [activeTab, setActiveTab] = useState<"chat" | "faq">("chat");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    WELCOME_MESSAGE,
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  // Focus input khi mở chat
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  // Fetch top FAQs
  useEffect(() => {
    if (topFAQs.length === 0) {
      apiClient
        .get<any, { success: boolean; data: FAQItem[] }>("/faq/top")
        .then((res) => {
          if (res.success && res.data && res.data.length > 0) {
            setTopFAQs(res.data);
          }
        })
        .catch(console.error);
    }
  }, []);

  // Clear new message indicator khi mở chat
  useEffect(() => {
    if (isOpen) setHasNewMessage(false);
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleReset = () => {
    setChatHistory([WELCOME_MESSAGE]);
  };

  const handleAskForm = useCallback(
    async (e?: React.FormEvent, predefined?: string) => {
      e?.preventDefault();
      const userQ = (predefined || question).trim();
      if (!userQ) return;

      const msgId = Date.now().toString();
      setQuestion("");
      setChatHistory((prev) => [
        ...prev,
        {
          id: msgId,
          role: "user",
          content: userQ,
          timestamp: new Date(),
        },
      ]);
      setIsTyping(true);

      try {
        const res = await apiClient.post<
          any,
          {
            success: boolean;
            data?: { answer: string; from_cache: boolean };
            error?: string;
          }
        >("/chat", { question: userQ });

        if (res.success && res.data) {
          setChatHistory((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "ai",
              content: res.data!.answer,
              fromCache: res.data!.from_cache,
              timestamp: new Date(),
            },
          ]);
          if (!isOpen) setHasNewMessage(true);
        } else {
          setChatHistory((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "ai",
              content:
                res.error || "Xin lỗi, hiện tại tôi không thể trả lời câu hỏi này.",
              timestamp: new Date(),
            },
          ]);
        }
      } catch {
        setChatHistory((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "ai",
            content: "Đã có lỗi kết nối với máy chủ AI. Xin thử lại sau.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [question, isOpen]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAskForm();
    }
  };

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
  };

  return (
    <>
      {/* ─── Floating Toggle Button ─────────────────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpen}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center group"
            style={{
              background: "linear-gradient(135deg, #e50914 0%, #ff4d4d 100%)",
              boxShadow:
                "0 8px 32px rgba(229, 9, 20, 0.5), 0 0 0 0 rgba(229, 9, 20, 0.4)",
            }}
            aria-label="Mở trợ lý AI"
          >
            {/* Pulse ring animation */}
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-30"
              style={{ background: "rgba(229, 9, 20, 0.6)" }}
            />
            <Bot className="w-7 h-7 text-white relative z-10" />
            {hasNewMessage && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-[#1c1d21] animate-pulse" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── Chat Window ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={
              isMinimized
                ? { opacity: 1, y: 0, scale: 1, height: "64px" }
                : { opacity: 1, y: 0, scale: 1, height: "600px" }
            }
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] flex flex-col overflow-hidden rounded-2xl"
            style={{
              background: "rgba(20, 20, 28, 0.98)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(229, 9, 20, 0.3)",
              boxShadow:
                "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)",
            }}
          >
            {/* ─ Header ──────────────────────────────────────────────────── */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0 cursor-pointer select-none"
              style={{
                background:
                  "linear-gradient(135deg, rgba(229,9,20,0.15) 0%, rgba(30,30,40,0.9) 100%)",
                borderBottom: isMinimized
                  ? "none"
                  : "1px solid rgba(229,9,20,0.15)",
              }}
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="relative w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #e50914 0%, #ff6b6b 100%)",
                    boxShadow: "0 4px 12px rgba(229, 9, 20, 0.5)",
                  }}
                >
                  <Bot className="w-5 h-5 text-white" />
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2"
                    style={{ borderColor: "#14141c" }}
                  />
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">
                    NOVA AI
                  </p>
                  <p className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse" />
                    Trực tuyến · Powered by Groq
                  </p>
                </div>
              </div>

              <div
                className="flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleReset}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-white/10 transition"
                  title="Cuộc trò chuyện mới"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-white/10 transition"
                  title={isMinimized ? "Mở rộng" : "Thu nhỏ"}
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition"
                  title="Đóng"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ─ Body (ẩn khi minimized) ─────────────────────────────────── */}
            {!isMinimized && (
              <>
                {/* ─ Tab Navigation ──────────────────────────────────────── */}
                <div
                  className="flex shrink-0"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <button
                    onClick={() => setActiveTab("chat")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-all duration-200 ${
                      activeTab === "chat"
                        ? "text-white border-b-2 border-red-500"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Trò chuyện
                  </button>
                  <button
                    onClick={() => setActiveTab("faq")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-all duration-200 ${
                      activeTab === "faq"
                        ? "text-white border-b-2 border-red-500"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Câu hỏi nhanh
                  </button>
                </div>

                {/* ─ Chat Tab ────────────────────────────────────────────── */}
                {activeTab === "chat" && (
                  <>
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin-custom">
                      {chatHistory.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                          {/* Avatar */}
                          {msg.role !== "user" && (
                            <div
                              className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center self-end mb-0.5"
                              style={{
                                background:
                                  "linear-gradient(135deg, #e50914, #ff6b6b)",
                              }}
                            >
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                          )}

                          {/* Bubble */}
                          <div
                            className={`max-w-[78%] ${
                              msg.role === "user" ? "items-end" : "items-start"
                            } flex flex-col gap-1`}
                          >
                            <div
                              className={`px-3.5 py-2.5 text-sm leading-relaxed rounded-2xl ${
                                msg.role === "user"
                                  ? "text-white rounded-tr-sm"
                                  : "text-gray-100 rounded-tl-sm"
                              }`}
                              style={
                                msg.role === "user"
                                  ? {
                                      background:
                                        "linear-gradient(135deg, #e50914 0%, #c5000e 100%)",
                                    }
                                  : {
                                      background: "rgba(255,255,255,0.06)",
                                      border:
                                        "1px solid rgba(255,255,255,0.08)",
                                    }
                              }
                              dangerouslySetInnerHTML={{
                                __html: formatContent(msg.content),
                              }}
                            />
                            {/* Metadata */}
                            <div
                              className={`flex items-center gap-1.5 text-[10px] text-gray-600 ${msg.role === "user" ? "justify-end" : ""}`}
                            >
                              <span>
                                {msg.timestamp.toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {msg.fromCache && (
                                <span className="flex items-center gap-0.5 text-emerald-500 font-medium">
                                  <Zap className="w-2.5 h-2.5" />
                                  Cache
                                </span>
                              )}
                            </div>
                          </div>

                          {msg.role === "user" && (
                            <div
                              className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center self-end mb-0.5"
                              style={{
                                background: "rgba(255,255,255,0.1)",
                              }}
                            >
                              <User className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </motion.div>
                      ))}

                      {/* Typing Indicator */}
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-2.5"
                        >
                          <div
                            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{
                              background:
                                "linear-gradient(135deg, #e50914, #ff6b6b)",
                            }}
                          >
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div
                            className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1"
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            {[0, 150, 300].map((delay) => (
                              <span
                                key={delay}
                                className="w-1.5 h-1.5 rounded-full animate-bounce"
                                style={{
                                  background: "#e50914",
                                  animationDelay: `${delay}ms`,
                                }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Quick suggestion chips (khi chỉ có welcome msg) */}
                      {chatHistory.length === 1 && !isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="flex flex-col gap-2"
                        >
                          <p className="text-xs text-gray-600 font-medium">
                            Gợi ý câu hỏi:
                          </p>
                          {QUICK_QUESTIONS.map((q) => (
                            <button
                              key={q}
                              onClick={() => handleAskForm(undefined, q)}
                              className="text-left px-3 py-2 text-xs text-gray-300 rounded-xl transition-all hover:text-white"
                              style={{
                                background: "rgba(229, 9, 20, 0.08)",
                                border: "1px solid rgba(229, 9, 20, 0.2)",
                              }}
                            >
                              {q}
                            </button>
                          ))}
                        </motion.div>
                      )}

                      <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div
                      className="shrink-0 p-3"
                      style={{
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        background: "rgba(10,10,15,0.6)",
                      }}
                    >
                      <form
                        onSubmit={handleAskForm}
                        className="flex items-center gap-2"
                      >
                        <input
                          ref={inputRef}
                          type="text"
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Nhập câu hỏi của bạn..."
                          disabled={isTyping}
                          className="flex-1 text-sm text-white placeholder-gray-600 bg-transparent outline-none disabled:opacity-50 py-2"
                        />
                        <button
                          type="submit"
                          disabled={isTyping || !question.trim()}
                          className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                          style={{
                            background: question.trim()
                              ? "linear-gradient(135deg, #e50914, #ff4d4d)"
                              : "rgba(255,255,255,0.06)",
                          }}
                        >
                          <Send className="w-4 h-4 text-white" />
                        </button>
                      </form>
                      <p className="text-center text-[9px] text-gray-700 mt-1.5 font-medium tracking-wide">
                        NOVA · Groq LLaMA · Semantic Cache ⚡
                      </p>
                    </div>
                  </>
                )}

                {/* ─ FAQ Tab ─────────────────────────────────────────────── */}
                {activeTab === "faq" && (
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <Pin className="w-3.5 h-3.5 text-red-500" />
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Câu hỏi phổ biến nhất
                      </p>
                    </div>
                    {topFAQs.length > 0 ? (
                      topFAQs.map((faq, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl overflow-hidden transition-all duration-300"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border:
                              expandedFaqId === idx
                                ? "1px solid rgba(229,9,20,0.3)"
                                : "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <button
                            onClick={() =>
                              setExpandedFaqId(
                                expandedFaqId === idx ? null : idx
                              )
                            }
                            className="w-full flex items-center justify-between p-3 text-sm text-left hover:bg-white/5 text-gray-300 font-medium transition-colors"
                          >
                            <span className="line-clamp-2 pr-4 text-xs leading-relaxed">
                              {faq.question}
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 text-gray-500 transition-transform duration-300 shrink-0 ${expandedFaqId === idx ? "rotate-180 text-red-400" : ""}`}
                            />
                          </button>
                          <AnimatePresence>
                            {expandedFaqId === idx && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                              >
                                <div
                                  className="px-3 pb-3 pt-0 text-xs text-gray-400 leading-relaxed"
                                  style={{
                                    borderTop:
                                      "1px solid rgba(255,255,255,0.06)",
                                  }}
                                >
                                  <div className="pt-2">
                                    {faq.answer.replace(/\[\d+\]\s*/g, "")}
                                  </div>
                                  <button
                                    onClick={() => {
                                      setActiveTab("chat");
                                      handleAskForm(undefined, faq.question);
                                    }}
                                    className="mt-2 flex items-center gap-1 text-red-400 hover:text-red-300 text-[10px] font-bold transition-colors"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    Hỏi thêm về chủ đề này
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                        <Sparkles className="w-8 h-8 mb-3 opacity-50" />
                        <p className="text-xs">Đang tải câu hỏi phổ biến...</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
