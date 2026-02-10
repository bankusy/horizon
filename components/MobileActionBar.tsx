"use client";

import React from "react";
import { Phone, MessageSquare, MessageCircle } from "lucide-react";

export default function MobileActionBar() {
  const phoneNumber = "01035007742";

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
              <Phone size={20} />
              <span className="text-[9px] font-bold tracking-wider uppercase">Call</span>
            </a>

            {/* 카카오톡 */}
            <a
              href="https://pf.kakao.com/_your_id"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-0.5 text-[#FEE500] active:scale-95 transition-all"
            >
              <MessageSquare size={20} fill="#FEE500" />
              <span className="text-[9px] font-bold tracking-wider uppercase">KakaoTalk</span>
            </a>

            {/* 문자 */}
            <a
              href={`sms:+82${phoneNumber}`}
              className="flex flex-col items-center gap-0.5 text-white/70 active:text-brand transition-colors"
            >
              <MessageCircle size={20} />
              <span className="text-[9px] font-bold tracking-wider uppercase">SMS</span>
            </a>
          </div>
        </div>
      </div>

      {/* Desktop Kakao Button — md 미만에서는 숨김 */}
      <button
        onClick={() => window.open("https://pf.kakao.com/_your_id", "_blank")}
        className="hidden md:flex fixed bottom-8 right-8 z-100 w-12 h-12 bg-[#FEE500] text-[#191919] items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 group rounded-[6px]"
        aria-label="KakaoTalk Consultation"
      >
        <MessageSquare fill="#191919" size={24} className="group-hover:rotate-12 transition-transform" />
      </button>
    </>
  );
}
