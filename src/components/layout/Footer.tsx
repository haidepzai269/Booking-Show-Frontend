"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  Layers,
  Tag,
  Info,
  Send,
  ArrowRight,
  Shield,
  HelpCircle,
  Sparkles,
  Globe,
  Ticket,
  CheckCircle,
  XCircle,
  Loader2,
  X
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function Footer() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setIsSubscribed(false);
        return;
      }
      try {
        const res = await apiClient.get<{subscribed: boolean, email?: string}>("/promotions/subscription-status");
        if (res.subscribed) {
          setIsSubscribed(true);
          setEmail(res.email || "");
        } else {
          setIsSubscribed(false);
        }
      } catch (err) {
        console.error("Failed to check newsletter subscription:", err);
      }
    };

    if (mounted) {
      checkSubscription();
    }
  }, [user, mounted]);

  if (pathname.startsWith("/admin")) return null;

  const toggleTab = (tab: string) => {
    setActiveTab(activeTab === tab ? "" : tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "features":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
            {[
              { icon: Layers, title: mounted ? t('footer.fast_booking') : 'Đặt vé nhanh', desc: mounted ? t('footer.fast_booking_desc') : 'Hệ thống đặt vé siêu tốc trong 30 giây' },
              { icon: Sparkles, title: 'AI Assistant', desc: mounted ? t('footer.ai_desc') : 'Trợ lý ảo thông minh gợi ý phim theo sở thích của bạn' },
              { icon: Globe, title: 'Multi-language', desc: mounted ? t('footer.lang_desc') : 'Hỗ trợ đa ngôn ngữ trải nghiệm toàn cầu' }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-primary/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="w-5 h-5 text-primary"/>
                </div>
                <h4 className="text-white font-bold mb-2">{item.title}</h4>
                <p className="text-xs text-white/50 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        );
      case "pricing":
        return (
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 text-gray-300 py-4">
             <div className="text-center group">
                <span className="text-6xl font-black text-white group-hover:text-primary transition-colors">85K</span>
                <p className="text-xs mt-3 uppercase tracking-[0.3em] font-bold text-white/40">{mounted ? t('footer.standard_ticket') : 'Vé thường'}</p>
             </div>
             <div className="w-px h-20 bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block"></div>
             <div className="text-center group">
                <span className="text-6xl font-black text-primary group-hover:text-white transition-colors">120K</span>
                <p className="text-xs mt-3 uppercase tracking-[0.3em] font-bold text-primary/50">{mounted ? t('footer.vip_ticket') : 'Vé VIP'}</p>
             </div>
          </div>
        );
      case "about":
        return (
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h3 className="text-4xl font-black text-white italic tracking-tighter">
              {mounted ? t('footer.about_title') : 'Về'} <span className="text-primary NOT-italic">BookingShow</span>
            </h3>
            <p className="text-lg text-white/60 leading-relaxed font-medium">
              {mounted ? t('footer.about_desc') : 'Chúng tôi mang đến trải nghiệm điện ảnh số một với công nghệ đặt vé tiên tiến và dịch vụ khách hàng tận tâm.'}
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <span className="px-4 py-2 bg-white/5 rounded-full text-xs font-bold border border-white/10">Since 2025</span>
              <span className="px-4 py-2 bg-primary/10 rounded-full text-xs font-bold border border-primary/20 text-primary">v2.4.0 High-End</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <footer className="w-full bg-[#050505] relative overflow-hidden border-t border-white/5">
      {/* Decorative gradient elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2" />

      {/* Tab content with Animation */}
      <AnimatePresence>
        {activeTab && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="w-full border-b border-white/5 bg-white/[0.02] backdrop-blur-3xl relative z-10 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-16 relative">
              <button 
                onClick={() => setActiveTab("")} 
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-primary hover:text-white transition-all group active:scale-95"
              >
                <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
              </button>
              {renderTabContent()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12 relative z-10">
        {/* Upper Section: Newsletter & Brand */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20 items-center">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(229,9,20,0.3)]">
                <Ticket className="w-7 h-7 text-white" />
              </div>
              <span className="text-4xl font-black tracking-tighter text-white uppercase italic">
                BOOKING<span className="text-primary NOT-italic">SHOW</span>
              </span>
            </Link>
            <p className="text-white/40 max-w-md text-lg leading-relaxed font-medium">
              Kiến tạo tương lai của trải nghiệm giải trí số. Đặt vé xem phim chưa bao giờ mượt mà và đẳng cấp đến thế.
            </p>
            <div className="flex items-center gap-4 text-white/60 pt-2">
               <div className="flex gap-4">
                 {[Facebook, Instagram, Youtube, Twitter].map((Social, i) => (
                   <Link key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white hover:-translate-y-1 transition-all duration-300">
                     <Social className="w-5 h-5" />
                   </Link>
                 ))}
               </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!mounted ? (
              <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-xl h-[200px] animate-pulse" />
            ) : user ? (
              <motion.div 
                key={isSubscribed ? "success" : "form"}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-xl relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-[2.5rem] pointer-events-none" />
                
                {isSubscribed ? (
                  <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 12 }}
                      className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30"
                    >
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </motion.div>
                    <div className="space-y-2">
                      <h4 className="text-2xl font-black text-green-500 uppercase tracking-wide">
                        ĐĂNG KÝ THÀNH CÔNG!
                      </h4>
                      <p className="text-white/60 font-medium">
                        {successMessage || "Hệ thống đã ghi nhớ bạn! Ưu đãi sẽ sớm đổ bộ vào hòm thư của bạn 🚀"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <h4 className="text-xl font-black text-white mb-2 flex items-center gap-2 uppercase tracking-wide">
                      Đăng ký nhận ưu đãi <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                    </h4>
                    <p className="text-white/40 text-sm mb-6">Nhận thông tin về các bộ phim bom tấn và hàng ngàn voucher giảm giá mỗi tuần.</p>
                    <form 
                      className="flex flex-col sm:row gap-3"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!email) return;
                        setIsSubscribing(true);
                        try {
                          const res = await apiClient.post<any, {success: boolean, message: string, error?: string}>("/promotions/subscribe", { email });
                          if (res.success) {
                            setIsSubscribed(true);
                            setSuccessMessage(res.message);
                            toast.success("Đăng ký thành công!");
                          } else {
                            toast.error(res.error || "Có lỗi xảy ra");
                          }
                        } catch (err: any) {
                          toast.error(err.response?.data?.error || "Không thể đăng ký lúc này");
                        } finally {
                          setIsSubscribing(false);
                        }
                      }}
                    >
                      <div className="relative flex-1 group/input">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within/input:text-primary transition-colors" />
                        <input 
                          type="email" 
                          required
                          placeholder="Email của bạn..." 
                          className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-white/20"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <button 
                        disabled={isSubscribing}
                        className="bg-primary hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 px-8 rounded-2xl transition-all shadow-[0_10px_20px_rgba(229,9,20,0.2)] active:scale-95 flex items-center justify-center gap-2 group/btn shrink-0"
                      >
                        {isSubscribing ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>GỬI NGAY <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" /></>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Middle Section: Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 border-t border-white/5 pt-16">
          <div className="space-y-6">
            <h5 className="text-white font-black text-xs uppercase tracking-[0.2em]">{mounted ? t('common.movies') : 'PHIM'}</h5>
            <ul className="space-y-3">
              {[
                { label: mounted ? t('common.now_showing') : 'Đang chiếu', href: '/movies' },
                { label: mounted ? t('common.coming_soon') : 'Sắp chiếu', href: '/movies' },
                { label: 'Phim Hot', href: '/movies' },
                { label: 'Phim 3D/IMAX', href: '/movies' }
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-white/40 hover:text-primary transition-colors text-sm font-medium flex items-center gap-1 group">
                    <div className="w-0 group-hover:w-1.5 h-px bg-primary transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            <h5 className="text-white font-black text-xs uppercase tracking-[0.2em]">{mounted ? t('common.promotions') : 'DỊCH VỤ'}</h5>
            <ul className="space-y-3">
              {[
                { label: 'Ưu đãi thẻ', href: '/promotions' },
                { label: 'Thành viên', href: '/profile' },
                { label: 'Đặt vé nhanh', href: '#' },
                { label: 'Mua bắp nước', href: '#' }
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-white/40 hover:text-primary transition-colors text-sm font-medium flex items-center gap-1 group">
                    <div className="w-0 group-hover:w-1.5 h-px bg-primary transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            <h5 className="text-white font-black text-xs uppercase tracking-[0.2em]">HỖ TRỢ</h5>
            <ul className="space-y-3">
              {[
                { label: 'Câu hỏi thường gặp', href: '#' },
                { label: 'Chính sách bảo mật', href: '#' },
                { label: 'Điều khoản sử dụng', href: '#' },
                { label: 'Liên hệ', href: '#' }
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-white/40 hover:text-primary transition-colors text-sm font-medium flex items-center gap-1 group">
                    <div className="w-0 group-hover:w-1.5 h-px bg-primary transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            <h5 className="text-white font-black text-xs uppercase tracking-[0.2em]">THÔNG TIN</h5>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-white/40 font-medium">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội
              </li>
              <li className="flex items-center gap-3 text-sm text-white/40 font-medium hover:text-white transition-colors">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                1900 6868
              </li>
              <li className="flex items-center gap-3 text-sm text-white/40 font-medium hover:text-white transition-colors">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                support@bookingshow.vn
              </li>
            </ul>
          </div>
        </div>

        {/* Lower Section: Navigation Tabs & Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-t border-white/5 pt-12">
          <div className="flex items-center gap-8 order-2 md:order-1">
             <span className="text-white/20 text-xs font-bold uppercase tracking-widest">&copy; 2025 BOOKING SHOW</span>
             <div className="flex gap-6">
                <button onClick={() => toggleTab("features")} className={`text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2 ${activeTab === 'features' ? 'text-primary' : 'text-white/40'}`}>
                  <Layers className="w-3 h-3"/> {mounted ? t('footer.features') : 'Tính năng'}
                </button>
                <button onClick={() => toggleTab("pricing")} className={`text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2 ${activeTab === 'pricing' ? 'text-primary' : 'text-white/40'}`}>
                  <Tag className="w-3 h-3"/> {mounted ? t('footer.pricing') : 'Giá vé'}
                </button>
                <button onClick={() => toggleTab("about")} className={`text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2 ${activeTab === 'about' ? 'text-primary' : 'text-white/40'}`}>
                  <Info className="w-3 h-3"/> {mounted ? t('footer.about') : 'Về chúng tôi'}
                </button>
             </div>
          </div>
          
          <div className="flex gap-4 order-1 md:order-2">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">SSL Secure</span>
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Support 24/7</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

