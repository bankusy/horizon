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
    <div className="space-y-12">
      {/* Area 1: Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-8 border-b border-border">
          <div className="space-y-3">
              <h2 className="text-5xl font-black tracking-tighter uppercase leading-none">
                  대시보드
              </h2>
              <p className="text-[10px] font-bold tracking-[0.3em] text-muted-foreground uppercase">
                  Studio Asset Management Overview
              </p>
          </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {stats.map((stat, i) => (
          <Card key={i} className="rounded-none border-border bg-card transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                {stat.title}
              </CardTitle>
              <div className="p-2.5 bg-secondary text-primary border border-border">
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black tracking-tighter mb-2 tabular-nums">{stat.value}</div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="rounded-none border-border bg-card overflow-hidden">
          <CardHeader className="p-8 border-b border-border bg-secondary/20">
            <CardTitle className="text-2xl font-black uppercase tracking-tight">빠른 실행</CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">이미지 아카이브 관리 도구</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <button 
              onClick={() => window.location.href = "/admin/gallery"}
              className="w-full text-left p-6 bg-secondary/50 border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-500 flex items-center justify-between group"
            >
              <span className="text-sm font-black uppercase tracking-widest">갤러리 리스트 관리</span>
              <ArrowUpRight size={18} className="translate-x-0 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />
            </button>
            <button 
              onClick={() => window.location.href = "/admin/gallery?tab=upload"}
              className="w-full text-left p-6 bg-secondary/50 border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-500 flex items-center justify-between group"
            >
              <span className="text-sm font-black uppercase tracking-widest">새 이미지 등록하기</span>
              <ArrowUpRight size={18} className="translate-x-0 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />
            </button>
          </CardContent>
        </Card>
        
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border opacity-40 grayscale group hover:opacity-100 hover:grayscale-0 transition-all duration-1000">
            <p className="text-[10px] font-black tracking-[0.5em] uppercase text-center mb-4">Archive Statistics</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">More Insights Coming Soon</p>
        </div>
      </div>
    </div>
  );
}
