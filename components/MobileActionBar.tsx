"use client";

import React from "react";
import { Phone, MessageSquare, MessageCircle, Globe } from "lucide-react";
import { usePathname } from "next/navigation";

export default function MobileActionBar() {
  const pathname = usePathname();
  const phoneNumber = "01035007742";
  const externalLink = "https://naver.com"; // Naver Blog placeholder

  // 관리자 페이지에서는 하단 바를 숨김
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {/* Mobile Bottom Bar — md 이상에서는 숨김 */}
      <div className="fixed bottom-0 inset-x-0 z-500 md:hidden">
        <div className="bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 safe-area-bottom">
          <div className="flex items-center justify-around h-14">
            {/* 전화 */}
            <a
              href={`tel:+82${phoneNumber}`}
              className="flex flex-col items-center gap-0.5 text-white/70 active:text-brand transition-colors"
            >
              <Phone size={18} />
              <span className="text-[8px] font-bold tracking-wider uppercase">Call</span>
            </a>

            {/* 카카오톡 */}
            <a
              href="https://pf.kakao.com/_your_id"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-0.5 text-[#FEE500] active:scale-95 transition-all"
            >
              <MessageSquare size={18} fill="#FEE500" />
              <span className="text-[8px] font-bold tracking-wider uppercase">Kakao</span>
            </a>

            {/* 문자 */}
            <a
              href={`sms:+82${phoneNumber}`}
              className="flex flex-col items-center gap-0.5 text-white/70 active:text-brand transition-colors"
            >
              <MessageCircle size={18} />
              <span className="text-[8px] font-bold tracking-wider uppercase">SMS</span>
            </a>
          </div>
        </div>
      </div>

      {/* Desktop Floating Buttons — md 미만에서는 숨김 */}
      <div className="hidden md:flex fixed bottom-8 right-8 z-100 flex-col items-center gap-3">
        {/* 1. 전화 버튼 */}
        <a
          href={`tel:+82${phoneNumber}`}
          className="w-12 h-12 bg-[#7FC243] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 group rounded-[6px]"
          aria-label="Phone Call"
        >
          <Phone size={24} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
        </a>

        {/* 2. 카카오톡 버튼 */}
        <button
          onClick={() => window.open("https://pf.kakao.com/_your_id", "_blank")}
          className="w-12 h-12 bg-[#FEE500] text-[#191919] flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 group rounded-[6px]"
          aria-label="KakaoTalk Consultation"
        >
          <MessageSquare fill="#191919" size={24} className="group-hover:rotate-12 transition-transform" />
        </button>

        {/* 3. 외부 링크 버튼 (Web) */}
        <a
          href={externalLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 bg-zinc-800 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 group rounded-[6px] border border-white/10"
          aria-label="Website"
        >
          <Globe size={24} className="group-hover:rotate-12 transition-transform" />
        </a>
      </div>
    </>
  );
}
