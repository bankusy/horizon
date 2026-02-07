"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Info } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1">설정</h2>
        <p className="text-sm text-muted-foreground">관리자 계정 및 스튜디오 환경을 설정합니다.</p>
      </div>

      <div className="grid gap-6">
        <Card className="rounded-xl border-border">
          <CardHeader>
            <CardTitle className="text-lg font-bold">서비스 정보</CardTitle>
            <CardDescription>현재 시스템의 상태와 기본 정보입니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-zinc-50 border border-border">
                <div className="mt-1 p-2 rounded-lg bg-white border border-border text-foreground">
                    <Info size={16} />
                </div>
                <div>
                   <p className="text-sm font-semibold">HORIZON 스튜디오 아카이브 v1.0.0</p>
                   <p className="text-xs text-muted-foreground mt-1">
                      본 시스템은 Supabase와 Next.js 15 환경에서 구동 중입니다. <br />
                      갤러리 배너 및 이미지 품질 관리 기능이 활성화되어 있습니다.
                   </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">관리자 계정</p>
                    <p className="text-sm font-medium">admin@horizon-studio.com</p>
                </div>
                <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">마지막 업데이트</p>
                    <p className="text-sm font-medium">2026. 02. 07</p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
