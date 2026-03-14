"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Bot,
  User,
  Loader2,
  MessageSquare,
  Minus,
  Maximize2,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { v4 as uuidv4 } from "uuid";

import { useChatStore } from "@/store/chatStore";

interface ChatMessage {
  role: "system" | "user" | "ai";
  content: string;
  created_at?: string;
}

export default function AIChatbot() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { isFloatingVisible, setFloatingVisible } = useChatStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Khởi tạo Session ID
  useEffect(() => {
    let sId = localStorage.getItem("chat_session_id");
    if (!sId) {
      sId = uuidv4();
      localStorage.setItem("chat_session_id", sId);
    }
    setSessionId(sId as string);
  }, []);

  // Cuộn xuống cuối
  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [chatHistory, isOpen, isMinimized, scrollToBottom]);

  // Tải lịch sử chat
  const lastFetchedRef = useRef<string | null>(null);

  useEffect(() => {
    if (sessionId && mounted) {
      // Tránh fetch lại nếu sessionId và user không đổi
      const cacheKey = `${sessionId}-${user?.id || 'guest'}`;
      if (lastFetchedRef.current === cacheKey) return;

      const fetchHistory = async () => {
        try {
          const res = await apiClient.get<any, { success: boolean; data: any[] }>(
            `/chat/history?session_id=${sessionId}`,
          );
          if (res.success && res.data) {
            setChatHistory(
              res.data.map((msg) => ({
                role: msg.role as "user" | "ai", // Changed from "assistant" to "ai" to match ChatMessage interface
                content: msg.content,
                created_at: msg.created_at, // Changed from "timestamp" to "created_at" to match ChatMessage interface
              })),
            );
            lastFetchedRef.current = cacheKey;
          }
        } catch (error) {
          console.error("Failed to fetch chat history:", error);
        }
      };
      
      fetchHistory();
    }
  }, [sessionId, user, mounted]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isTyping) return;

    const userQ = question.trim();
    setQuestion("");
    
    // Thêm tin nhắn user vào UI ngay lập tức
    setChatHistory((prev) => [...prev, { role: "user", content: userQ }]);
    setIsTyping(true);

    try {
      const res = await apiClient.post<any, { success: boolean; data?: { answer: string }; error?: string }>(
        "/faq/ask",
        {
          question: userQ,
          session_id: sessionId,
        }
      );

      if (res.success && res.data) {
        setChatHistory((prev) => [
          ...prev,
          { role: "ai", content: res.data!.answer },
        ]);
      } else {
        throw new Error(res.error || t('chatbot.no_answer'));
      }
    } catch (error: any) {
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", content: t('chatbot.error_msg') },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = useCallback((force: boolean = false) => {
    if (force || confirm(t('chatbot.clear_history_confirm'))) {
      setChatHistory([]);
      // Reset session ID để đảm bảo không bị dính vết cũ cho khách mới
      const newSid = uuidv4();
      localStorage.setItem("chat_session_id", newSid);
      setSessionId(newSid);
    }
  }, []);

  // Xử lý tự động xóa chat khi đăng xuất (Logout)
  useEffect(() => {
    // Nếu mounted và trước đó có user nhưng giờ không có -> vừa logout
    if (mounted && !user) {
      setChatHistory([]);
      const newSid = uuidv4();
      localStorage.setItem("chat_session_id", newSid);
      setSessionId(newSid);
    }
  }, [user, mounted]);

  if (!mounted) return null;

  return (
    <>
      <AnimatePresence>
        {/* NÚT ICON CHAT (Floating Button) */}
        {!isOpen && isFloatingVisible && (
          <motion.div
            layoutId="chatbot-icon-container"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', left: 'auto' }}
            className="z-[200] w-16 h-16 pointer-events-none"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="w-full h-full bg-primary rounded-full shadow-[0_0_30px_rgba(229,9,20,0.5)] flex items-center justify-center text-white cursor-pointer group overflow-hidden pointer-events-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <motion.div layoutId="chatbot-icon">
                <Bot className="w-8 h-8 group-hover:animate-float" />
              </motion.div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#0a0a0a] rounded-full animate-pulse" />
            </motion.button>

            {/* Nút Dismiss (X nhỏ) */}
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => {
                e.stopPropagation();
                setFloatingVisible(false);
              }}
              className="absolute -top-2 -left-2 w-7 h-7 bg-[#1a1c21] border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors shadow-lg pointer-events-auto"
              title={mounted ? t('chatbot.minimize_to_header') : 'Thu nhỏ'}
            >
              <X className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                height: isMinimized ? "64px" : "600px"
            }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{ 
                originX: isMobile ? 0.5 : 1, 
                originY: 1, 
                position: 'fixed', 
                bottom: isMobile ? '1rem' : '1.5rem', 
                right: isMobile ? 'auto' : '1.5rem', 
                left: isMobile ? '50%' : 'auto',
                x: isMobile ? "-50%" : "0%"
            }}
            className={`z-[200] w-[92vw] md:w-[400px] bg-[#1a1c21] rounded-[2rem] shadow-[0_10px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border border-white/10 ${isMinimized ? 'pointer-events-none' : ''}`}
          >
            {/* HEADER */}
            <div className="p-4 bg-gradient-to-r from-primary/20 to-transparent border-b border-white/5 flex items-center justify-between pointer-events-auto">
              {/* ... (Header content remains same) */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center shadow-inner">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-white font-black text-sm uppercase tracking-tight">{mounted ? t('common.ai_assistant') : 'Trợ lý AI'}</h3>
                  <p className="text-[10px] text-primary font-bold uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> {mounted ? t('chatbot.online') : 'Trực tuyến'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-2 hover:bg-white/10 rounded-xl text-gray-400 transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                </button>
                <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-xl text-gray-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CHAT BODY */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                  {chatHistory.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                      <Bot className="w-16 h-16 mb-4 text-primary" />
                      <p className="text-sm text-white font-medium">{mounted ? t('chatbot.empty_state') : 'Bắt đầu cuộc trò chuyện'}</p>
                      <p className="text-xs text-gray-400 mt-2">{mounted ? t('chatbot.empty_help') : 'Hỏi tôi bất cứ điều gì về phim ảnh'}</p>
                    </div>
                  )}
                  {chatHistory.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-white/10" : "bg-primary/20 border border-primary/20"}`}>
                        {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-primary" />}
                      </div>
                      <div className={`p-4 rounded-3xl text-sm max-w-[80%] shadow-lg leading-relaxed ${
                        msg.role === "user" 
                          ? "bg-primary text-white rounded-tr-sm" 
                          : "bg-white/5 text-gray-100 border border-white/10 rounded-tl-sm backdrop-blur-md"
                      }`}>
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary/20 border border-primary/20">
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      </div>
                      <div className="p-4 rounded-3xl text-sm bg-white/5 text-gray-200 border border-white/10 rounded-tl-sm flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* INPUT AREA */}
                <div className="p-4 border-t border-white/5 bg-black/20 pointer-events-auto">
                    <div className="flex items-center gap-2 mb-2">
                        <button 
                            onClick={() => clearChat(false)}
                            className="text-[10px] text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1 uppercase font-bold tracking-widest"
                        >
                            <Trash2 className="w-3 h-3" /> {t('chatbot.clear_chat')}
                        </button>
                    </div>
                  <form onSubmit={handleAsk} className="flex gap-2 relative">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder={t('chatbot.input_placeholder')}
                      disabled={isTyping}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-50 shadow-inner"
                    />
                    <button
                      type="submit"
                      disabled={isTyping || !question.trim()}
                      className="absolute right-1.5 top-1.5 w-11 h-11 bg-primary hover:bg-primary-hover rounded-xl flex items-center justify-center text-white disabled:opacity-50 transition-all shadow-lg active:scale-95 group"
                    >
                      <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </form>
                  <p className="text-[9px] text-gray-600 text-center mt-3 uppercase font-bold tracking-[0.2em]">BookingShow AI Agent &copy; 2025</p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
