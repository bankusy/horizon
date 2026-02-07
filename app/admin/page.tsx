"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    Image as ImageIcon, 
    Users, 
    Eye, 
    ArrowUpRight,
    TrendingUp
} from "lucide-react";

export default function AdminDashboardPage() {
  const [imageCount, setImageCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchStats() {
      if (!supabase) return;
      const { count, error } = await supabase
        .from("gallery")
        .select("*", { count: 'exact', head: true });
      
      if (!error && count !== null) {
        setImageCount(count);
      }
    }
    fetchStats();
  }, []);

  const stats = [
    { title: "전체 이미지", value: imageCount !== null ? imageCount.toString() : "...", icon: ImageIcon, trend: "진행 중", color: "text-blue-600" },
    { title: "갤러리 조회수", value: "1,248", icon: Eye, trend: "+12.5%", color: "text-green-600" },
    { title: "문의 내역", value: "8", icon: Users, trend: "지난 주 대비 -5%", color: "text-orange-600" },
    { title: "참여율", value: "3.2%", icon: TrendingUp, trend: "+0.4%", color: "text-purple-600" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1">환영합니다, 관리자님</h2>
        <p className="text-sm text-muted-foreground">오늘의 HORIZON 스튜디오 현황입니다.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="rounded-xl border-border ">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-zinc-50 ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <p className="text-xs font-medium text-muted-foreground">
                {stat.trend} 지난 기간 대비
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 rounded-xl border-border ">
          <CardHeader>
            <CardTitle className="text-lg font-bold">최근 활동</CardTitle>
            <CardDescription>아카이브 활동에 대한 시각적 요약입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative h-[300px] w-full bg-zinc-50 rounded-lg flex flex-col items-center justify-center border border-dashed border-border p-8">
                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                    <TrendingUp size={24} />
                </div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">성장 지표 시각화 영역</p>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-3 rounded-xl border-border ">
          <CardHeader>
            <CardTitle className="text-lg font-bold">빠른 실행</CardTitle>
            <CardDescription>자주 사용하는 관리 도구 바로가기입니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full text-left p-4 rounded-lg bg-zinc-50 border border-border hover:bg-zinc-100 transition-all flex items-center justify-between group">
              <span className="text-sm font-semibold">새 이미지 등록</span>
              <ArrowUpRight size={16} className="text-muted-foreground group-hover:text-foreground transition-all" />
            </button>
            <button className="w-full text-left p-4 rounded-lg bg-zinc-50 border border-border hover:bg-zinc-100 transition-all flex items-center justify-between group">
              <span className="text-sm font-semibold">로그 확인</span>
              <ArrowUpRight size={16} className="text-muted-foreground group-hover:text-foreground transition-all" />
            </button>
            <button className="w-full text-left p-4 rounded-lg bg-zinc-50 border border-border hover:bg-zinc-100 transition-all flex items-center justify-between group">
              <span className="text-sm font-semibold">환경 설정 변경</span>
              <ArrowUpRight size={16} className="text-muted-foreground group-hover:text-foreground transition-all" />
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
