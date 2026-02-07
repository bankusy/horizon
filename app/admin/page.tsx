"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    Image as ImageIcon, 
    Eye, 
    ArrowUpRight,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [imageCount, setImageCount] = useState<number | null>(null);
  const [bannerCount, setBannerCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchStats() {
      if (!supabase) return;
      
      const [galleryRes, bannersRes] = await Promise.all([
        supabase.from("gallery").select("*", { count: 'exact', head: true }),
        supabase.from("banners").select("*", { count: 'exact', head: true })
      ]);
      
      if (!galleryRes.error && galleryRes.count !== null) {
        setImageCount(galleryRes.count);
      }
      
      if (!bannersRes.error && bannersRes.count !== null) {
        setBannerCount(bannersRes.count);
      }
    }
    fetchStats();
  }, []);

  const stats = [
    { title: "전체 갤러리 이미지", value: imageCount !== null ? imageCount.toString() : "...", icon: ImageIcon, trend: "아카이브", color: "text-foreground" },
    { title: "활성화된 배너", value: bannerCount !== null ? bannerCount.toString() : "...", icon: Eye, trend: "메인 슬라이드", color: "text-foreground" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1">환영합니다, 관리자님</h2>
        <p className="text-sm text-muted-foreground">오늘의 HORIZON 스튜디오 현황입니다.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {stats.map((stat, i) => (
          <Card key={i} className="rounded-xl border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-tighter">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-xl border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold">빠른 실행</CardTitle>
            <CardDescription>이미지 아카이브 관리 도구입니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button 
              onClick={() => window.location.href = "/admin/gallery"}
              className="w-full text-left p-4 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-all flex items-center justify-between group"
            >
              <span className="text-sm font-semibold">갤러리 리스트 관리</span>
              <ArrowUpRight size={16} className="text-muted-foreground group-hover:text-foreground transition-all" />
            </button>
            <button 
              onClick={() => window.location.href = "/admin/gallery?tab=add"}
              className="w-full text-left p-4 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-all flex items-center justify-between group"
            >
              <span className="text-sm font-semibold">새 이미지 등록하기</span>
              <ArrowUpRight size={16} className="text-muted-foreground group-hover:text-foreground transition-all" />
            </button>
          </CardContent>
        </Card>
        {/* Placeholder for future specific gallery stats */}
        <div className="flex items-center justify-center p-8 border border-dashed border-border rounded-xl opacity-40 grayscale">
            <p className="text-[10px] font-black tracking-[0.5em] uppercase text-center">Archive Statistics Coming Soon</p>
        </div>
      </div>
    </div>
  );
}
