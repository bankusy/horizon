"use client";

import React from "react";
import { MessageSquare } from "lucide-react";

export default function KakaoButton() {
  const openKakao = () => {
    // 카카오톡 상담 링크 (나중에 실제 링크로 대체 가능)
    window.open("https://pf.kakao.com/_your_id", "_blank");
  };

  return (
    <button
      onClick={openKakao}
      className="fixed bottom-8 right-8 z-100 w-12 h-12 bg-[#FEE500] text-[#191919] flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 group"
      aria-label="KakaoTalk Consultation"
    >
      <MessageSquare fill="#191919" size={24} className="group-hover:rotate-12 transition-transform" />
    </button>
  );
}
