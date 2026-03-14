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
  Loader2,
  Minus,
  Maximize2,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { v4 as uuidv4 } from "uuid";
import { useChatStore } from "@/store/chatStore";

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

export default function AIChatbot() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { isFloatingVisible, setFloatingVisible } = useChatStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [question, setQuestion] = useState("");
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);
  const [topFAQs, setTopFAQs] = useState<FAQItem[]>([]);
  const [activeTab, setActiveTab] = useState<"chat" | "faq">("chat");
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const WELCOME_MESSAGE: ChatMessage = {
    id: "welcome",
    role: "system",
    content: t('chatbot.welcome_msg', { defaultValue: "Xin chào! 👋 Mình là **NOVA** — Trợ lý AI thông minh của **BookingShow**!\n\nMình có thể giúp bạn:\n• 🎬 Tìm phim đang chiếu\n• 💰 Tư vấn giá vé & combo\n• 🎫 Hướng dẫn đặt vé\n• ❓ Giải đáp mọi thắc mắc" }),
    timestamp: new Date(),
  };

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [mounted, setMounted] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    let sId = localStorage.getItem("chat_session_id");
    if (!sId) {
      sId = uuidv4();
      localStorage.setItem("chat_session_id", sId);
    }
    setSessionId(sId);
  }, []);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  // Focus input
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  // Fetch top FAQs
  useEffect(() => {
    if (mounted && topFAQs.length === 0) {
      apiClient
        .get<any, { success: boolean; data: FAQItem[] }>("/faq/top")
        .then((res) => {
          if (res.success && res.data && res.data.length > 0) {
            setTopFAQs(res.data);
          }
        })
        .catch(console.error);
    }
  }, [mounted, topFAQs.length]);

  useEffect(() => {
    if (isOpen) setHasNewMessage(false);
  }, [isOpen]);

  // Xử lý tự động xóa chat khi đăng xuất (Logout)
  useEffect(() => {
    if (mounted && !user) {
      setChatHistory([WELCOME_MESSAGE]);
      const newSid = uuidv4();
      localStorage.setItem("chat_session_id", newSid);
      setSessionId(newSid);
    }
  }, [user, mounted, WELCOME_MESSAGE]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleReset = () => {
    if (confirm(t('chatbot.clear_history_confirm', { defaultValue: "Xóa toàn bộ lịch sử trò chuyện?" }))) {
      setChatHistory([WELCOME_MESSAGE]);
      const newSid = uuidv4();
      localStorage.setItem("chat_session_id", newSid);
      setSessionId(newSid);
    }
  };

  const handleAskForm = useCallback(
    async (e?: React.FormEvent, predefined?: string) => {
      if (e) e.preventDefault();
      const userQ = (predefined || question).trim();
      if (!userQ || isTyping) return;

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
        >("/faq/ask", { question: userQ, session_id: sessionId });

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
          throw new Error(res.error || "Không nhận được phản hồi từ AI");
        }
      } catch (err: any) {
        setChatHistory((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "ai",
            content: err.message || t('chatbot.error_msg', { defaultValue: "Đã có lỗi kết nối với máy chủ AI. Xin thử lại sau." }),
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [question, isOpen, isTyping, sessionId, t, WELCOME_MESSAGE]
  );

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
  };

  if (!mounted) return null;

  const QUICK_QUESTIONS = [
    t('chatbot.q1', { defaultValue: "Giá vé xem phim là bao nhiêu?" }),
    t('chatbot.q2', { defaultValue: "Làm sao để đặt vé online?" }),
    t('chatbot.q3', { defaultValue: "Có phim gì đang chiếu không?" }),
  ];

  return (
    <>
      <AnimatePresence>
        {!isOpen && isFloatingVisible && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center group cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #e50914 0%, #ff4d4d 100%)",
              boxShadow: "0 8px 32px rgba(229, 9, 20, 0.5)",
            }}
            onClick={handleOpen}
          >
            <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: "rgba(229, 9, 20, 0.6)" }} />
            <Bot className="w-7 h-7 text-white relative z-10" />
            {hasNewMessage && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-[#1c1d21] animate-pulse" />
            )}
            <button
               onClick={(e) => {
                e.stopPropagation();
                setFloatingVisible(false);
              }}
              className="absolute -top-2 -left-2 w-6 h-6 bg-[#1a1c21] border border-white/10 rounded-full flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
              title={t('chatbot.dismiss_floating_button', { defaultValue: "Ẩn nút nổi" })}
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1, 
              height: isMinimized ? "64px" : "600px" 
            }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] flex flex-col overflow-hidden rounded-2xl"
            style={{
              background: "rgba(20, 20, 28, 0.98)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(229, 9, 20, 0.3)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
            }}
          >
            {/* Header */}
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
                    {t('chatbot.online_powered_by', { defaultValue: "Trực tuyến · Powered by Groq" })}
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
                  title={t('chatbot.new_conversation', { defaultValue: "Cuộc trò chuyện mới" })}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-white/10 transition"
                  title={isMinimized ? t('chatbot.expand', { defaultValue: "Mở rộng" }) : t('chatbot.minimize', { defaultValue: "Thu nhỏ" })}
                >
                  {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition"
                  title={t('chatbot.close', { defaultValue: "Đóng" })}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Tab Navigation */}
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
                    {t('chatbot.tab_chat', { defaultValue: "Trò chuyện" })}
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
                    {t('chatbot.tab_faq', { defaultValue: "Câu hỏi nhanh" })}
                  </button>
                </div>

                {/* Chat Tab */}
                {activeTab === "chat" && (
                  <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                      {chatHistory.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                          <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center self-end mb-1 ${msg.role === "user" ? "bg-white/10" : "bg-gradient-to-br from-primary to-red-500"}`}>
                            {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                          </div>
                          <div className={`max-w-[80%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : ""}`}>
                             <div 
                                className={`p-3 text-sm rounded-2xl ${msg.role === "user" ? "bg-primary text-white rounded-tr-none" : "bg-white/5 text-gray-100 border border-white/10 rounded-tl-none"}`}
                                dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                             />
                             <div className="text-[9px] text-gray-600 flex items-center gap-1.5">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {msg.fromCache && <span className="text-emerald-500 font-bold flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" /> Cache</span>}
                             </div>
                          </div>
                        </motion.div>
                      ))}
                      {isTyping && (
                        <div className="flex gap-2.5">
                          <div className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-red-500 flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
                          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none flex gap-1 items-center">
                            {[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                          </div>
                        </div>
                      )}
                      {chatHistory.length === 1 && !isTyping && (
                        <div className="flex flex-col gap-2 mt-2">
                           <p className="text-xs text-gray-600 font-medium">{t('chatbot.suggested_questions', { defaultValue: "Gợi ý câu hỏi:" })}</p>
                           {QUICK_QUESTIONS.map(q => (
                             <button key={q} onClick={() => handleAskForm(undefined, q)} className="text-left p-2.5 text-xs text-gray-400 bg-primary/5 border border-primary/20 rounded-xl hover:text-white transition-colors">{q}</button>
                           ))}
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    
                    <div className="p-3 bg-black/20 border-t border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <button onClick={handleReset} className="text-[10px] text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1 uppercase font-bold tracking-widest">
                          <Trash2 className="w-3 h-3" /> {t('chatbot.clear_chat', { defaultValue: "Xóa hội thoại" })}
                        </button>
                      </div>
                      <form onSubmit={handleAskForm} className="flex gap-2 items-center">
                        <input 
                          ref={inputRef}
                          value={question}
                          onChange={e => setQuestion(e.target.value)}
                          placeholder={t('chatbot.input_placeholder', { defaultValue: "Nhập câu hỏi của bạn..." })}
                          disabled={isTyping}
                          className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-gray-600 py-2"
                        />
                        <button disabled={!question.trim() || isTyping} className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center disabled:opacity-50 shadow-lg">
                          {isTyping ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
                        </button>
                      </form>
                      <p className="text-center text-[9px] text-gray-700 mt-2 font-medium tracking-wide">NOVA · BookingShow AI &copy; 2025</p>
                    </div>
                  </>
                )}

                {/* FAQ Tab */}
                {activeTab === "faq" && (
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                    <div className="flex items-center gap-2 mb-2">
                      <Pin className="w-3.5 h-3.5 text-red-500" />
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('chatbot.top_faq', { defaultValue: "Câu hỏi thường gặp" })}</p>
                    </div>
                    {topFAQs.length > 0 ? (
                      topFAQs.map((faq, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/5 rounded-xl overflow-hidden">
                          <button onClick={() => setExpandedFaqId(expandedFaqId === idx ? null : idx)} className="w-full flex items-center justify-between p-3 text-xs text-left text-gray-300 hover:bg-white/5 transition-colors">
                            <span className="font-medium pr-4">{faq.question}</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${expandedFaqId === idx ? 'rotate-180 text-primary' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {expandedFaqId === idx && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                                <div className="p-3 pt-0 text-xs text-gray-400 leading-relaxed border-t border-white/5 bg-white/5">
                                  {faq.answer.replace(/\[\d+\]/g, "")}
                                  <button onClick={() => { setActiveTab("chat"); handleAskForm(undefined, faq.question); }} className="mt-3 flex items-center gap-1.5 text-primary text-[10px] font-bold hover:underline">
                                    <MessageSquare className="w-3 h-3" /> {t('chatbot.ask_more', { defaultValue: "Hỏi thêm về chủ đề này" })}
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-600 opacity-50">
                        <Sparkles className="w-8 h-8 mb-3 animate-pulse" />
                        <p className="text-xs">{t('common.loading', { defaultValue: "Đang tải..." })}</p>
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
