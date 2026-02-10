"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Info, LayoutGrid, Save, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface GalleryColumnSettings {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

export default function AdminSettingsPage() {
  const [columns, setColumns] = useState<GalleryColumnSettings>({
    mobile: 1,
    tablet: 2,
    desktop: 4,
    wide: 5,
  });
  const [borderRadius, setBorderRadius] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 설정 로드
  useEffect(() => {
    async function loadSettings() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "gallery_columns")
          .single();

        const { data: radiusData, error: radiusError } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "gallery_image_radius")
          .single();
        
        if (!error && data) {
          setColumns(data.value as GalleryColumnSettings);
        }

        if (!radiusError && radiusData) {
            setBorderRadius(Number(radiusData.value) || 0);
        }
      } catch (e) {
        console.error("Settings load failed:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  // 설정 저장
  const handleSave = async () => {
    if (!supabase) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ 
          key: "gallery_columns", 
          value: columns,
          updated_at: new Date().toISOString()
        });

      const { error: radiusError } = await supabase
        .from("site_settings")
        .upsert({ 
          key: "gallery_image_radius", 
          value: borderRadius,
          updated_at: new Date().toISOString()
        });
      
      if (error || radiusError) throw error || radiusError;
      toast.success("설정이 저장되었습니다.");
    } catch (e) {
      console.error("Settings save failed:", e);
      toast.error("설정 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateColumn = (key: keyof GalleryColumnSettings, value: number) => {
    setColumns(prev => ({ ...prev, [key]: Math.max(1, Math.min(8, value)) }));
  };

  return (
    <div className="space-y-12">
      {/* Area 1: Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-8 border-b border-border">
        <div className="space-y-3">
          <h2 className="text-5xl font-black tracking-tighter uppercase leading-none">
            설정
          </h2>
          <p className="text-[10px] font-bold tracking-[0.3em] text-muted-foreground uppercase">
            System Configuration & Preferences
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* 갤러리 그리드 설정 */}
        <Card className="rounded-none border-border bg-card overflow-hidden">
          <CardHeader className="p-8 border-b border-border bg-secondary/20">
            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-foreground">
              <LayoutGrid size={24} className="text-primary" />
              갤러리 그리드 설정
            </CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">화면 크기별 이미지 배열 규칙을 설정합니다.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
                      모바일 (640px 이하)
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={8}
                      value={columns.mobile}
                      onChange={(e) => updateColumn("mobile", parseInt(e.target.value) || 1)}
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
                      태블릿 (768px ~ 1024px)
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={8}
                      value={columns.tablet}
                      onChange={(e) => updateColumn("tablet", parseInt(e.target.value) || 2)}
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
                      데스크탑 (1280px ~ 1536px)
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={8}
                      value={columns.desktop}
                      onChange={(e) => updateColumn("desktop", parseInt(e.target.value) || 4)}
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
                      와이드 (1536px 이상)
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={8}
                      value={columns.wide}
                      onChange={(e) => updateColumn("wide", parseInt(e.target.value) || 5)}
                      className="h-10 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-8 border-t border-border">
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="rounded-none px-10 h-12 font-black uppercase tracking-widest text-[11px] transition-all duration-500"
                  >
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4 stroke-3" />
                    )}
                    현재 설정 저장
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 이미지 스타일 설정 */}
        <Card className="rounded-none border-border bg-card overflow-hidden">
          <CardHeader className="p-8 border-b border-border bg-secondary/20">
            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-foreground">
              <Settings size={24} className="text-primary" />
              이미지 스타일 설정
            </CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">
              갤러리 이미지의 시각적 스타일을 조정합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
                  이미지 라운드 (px)
                </label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-10 rounded-lg"
                  />
                  <div 
                    className="h-10 w-10 bg-primary transition-all duration-300 border border-border"
                    style={{ borderRadius: `${borderRadius}px` }}
                    title="미리보기"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  0으로 설정하면 직각 모서리가 됩니다.
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-8 mt-8 border-t border-border">
                <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="rounded-none px-10 h-12 font-black uppercase tracking-widest text-[11px] transition-all duration-500"
                >
                {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Save className="mr-2 h-4 w-4 stroke-3" />
                )}
                스타일 저장
                </Button>
            </div>
          </CardContent>
        </Card>

        {/* 서비스 정보 */}
        <Card className="rounded-none border-border bg-card overflow-hidden">
          <CardHeader className="p-8 border-b border-border bg-secondary/20">
            <CardTitle className="text-xl font-black uppercase tracking-tight text-foreground">서비스 정보</CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">시스템 엔진 및 버전 정보입니다.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="flex items-start gap-6 p-6 rounded-none bg-secondary/30 border border-border">
                <div className="mt-1 p-3 rounded-none bg-card border border-border text-foreground">
                    <Info size={20} className="text-primary" />
                </div>
                <div>
                   <p className="text-lg font-black tracking-tight uppercase">HORIZON Studio OS v1.1.0</p>
                   <p className="text-[10px] font-bold text-muted-foreground mt-2 leading-relaxed uppercase tracking-widest">
                      PRO UI Redesign Phase Completed. <br />
                      Proprietary Visualization Engine Active.
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
                    <p className="text-sm font-medium">2026. 02. 09</p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
