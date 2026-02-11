"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Info, LayoutGrid, Save, Loader2, Shuffle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface GalleryColumnSettings {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
  [key: string]: number;
}

interface GalleryColumnState {
  mobile: string | number;
  tablet: string | number;
  desktop: string | number;
  wide: string | number;
  [key: string]: string | number;
}

export default function AdminSettingsPage() {
  const [columns, setColumns] = useState<GalleryColumnState>({
    mobile: "1",
    tablet: "2",
    desktop: "4",
    wide: "5",
  });
  const [vrColumns, setVrColumns] = useState<GalleryColumnState>({
    mobile: "1",
    tablet: "2",
    desktop: "3",
    wide: "3",
  });
  const [borderRadius, setBorderRadius] = useState<string | number>(0);
  const [borderWidth, setBorderWidth] = useState<string | number>(0);
  const [borderColor, setBorderColor] = useState<string>("#ffffff");
  const [bgLight, setBgLight] = useState<string>("#ffffff");
  const [bgDark, setBgDark] = useState<string>("#09090b");
  const [heroHeading, setHeroHeading] = useState<string>("WE VISUALIZE THE UNBUILT");
  const [heroSubheader, setHeroSubheader] = useState<string>("CAPTURING ALL THE ESSENCE");
  const [heroDescription, setHeroDescription] = useState<string>("ARCHITECTURAL VISUALIZATION STUDIO");
  const [heroHeadingColor, setHeroHeadingColor] = useState<string>("");
  const [heroSubheaderColor, setHeroSubheaderColor] = useState<string>("");
  const [heroDescriptionColor, setHeroDescriptionColor] = useState<string>("");
  const [heroHeadingSize, setHeroHeadingSize] = useState<string | number>("");
  const [heroSubheaderSize, setHeroSubheaderSize] = useState<string | number>("");
  const [heroDescriptionSize, setHeroDescriptionSize] = useState<string | number>("");
  const [heroHeadingSizeMobile, setHeroHeadingSizeMobile] = useState<string | number>("");
  const [heroSubheaderSizeMobile, setHeroSubheaderSizeMobile] = useState<string | number>("");
  const [heroDescriptionSizeMobile, setHeroDescriptionSizeMobile] = useState<string | number>("");
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [itemsPerPage, setItemsPerPage] = useState<string | number>(50);
  const [initialItems, setInitialItems] = useState<string | number>(50);
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
            setBorderRadius(radiusData.value);
        }

        const { data: borderData } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "gallery_image_border_width")
          .single();
        
        if (borderData) {
          setBorderWidth(borderData.value);
        }

        const { data: borderColorData } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "gallery_image_border_color")
          .single();
        
        if (borderColorData) {
          setBorderColor(String(borderColorData.value));
        }

        const { data: bgLightData } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "gallery_bg_light")
          .single();
        
        if (bgLightData) {
          setBgLight(String(bgLightData.value));
        }

        const { data: bgDarkData } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "gallery_bg_dark")
          .single();
        
        if (bgDarkData) {
          setBgDark(String(bgDarkData.value));
        }

        const { data: heroData } = await supabase
          .from("site_settings")
          .select("key, value")
          .like("key", "hero_%");

        if (heroData) {
          heroData.forEach((item: { key: string; value: any }) => {
            switch (item.key) {
              case "hero_heading": setHeroHeading(String(item.value)); break;
              case "hero_subheader": setHeroSubheader(String(item.value)); break;
              case "hero_description": setHeroDescription(String(item.value)); break;
              case "hero_heading_color": setHeroHeadingColor(String(item.value)); break;
              case "hero_subheader_color": setHeroSubheaderColor(String(item.value)); break;
              case "hero_description_color": setHeroDescriptionColor(String(item.value)); break;
               case "hero_heading_size": setHeroHeadingSize(item.value); break;
              case "hero_subheader_size": setHeroSubheaderSize(item.value); break;
              case "hero_description_size": setHeroDescriptionSize(item.value); break;
              case "hero_heading_size_mobile": setHeroHeadingSizeMobile(item.value); break;
              case "hero_subheader_size_mobile": setHeroSubheaderSizeMobile(item.value); break;
              case "hero_description_size_mobile": setHeroDescriptionSizeMobile(item.value); break;
            }
          });
        }

        const { data: shuffleData } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "gallery_shuffle")
          .single();

        if (shuffleData?.value !== undefined) {
          setIsShuffled(Boolean(shuffleData.value));
        }

        const { data: pagingData } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "gallery_items_per_page")
          .single();

        if (pagingData?.value !== undefined) {
          setItemsPerPage(Number(pagingData.value) || 50);
        }

        const { data: initialDataReq } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "gallery_initial_items")
          .single();

        if (initialDataReq?.value !== undefined) {
          setInitialItems(Number(initialDataReq.value) || 50);
        }

        const { data: vrColumnData } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "vr_columns")
          .single();

        if (vrColumnData?.value) {
          setVrColumns(vrColumnData.value as GalleryColumnSettings);
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
      const validatedColumns = {
        mobile: Math.max(1, Math.min(12, parseInt(String(columns.mobile)) || 1)),
        tablet: Math.max(1, Math.min(12, parseInt(String(columns.tablet)) || 2)),
        desktop: Math.max(1, Math.min(12, parseInt(String(columns.desktop)) || 4)),
        wide: Math.max(1, Math.min(12, parseInt(String(columns.wide)) || 5)),
      };

      const validatedVrColumns = {
        mobile: Math.max(1, Math.min(12, parseInt(String(vrColumns.mobile)) || 1)),
        tablet: Math.max(1, Math.min(12, parseInt(String(vrColumns.tablet)) || 2)),
        desktop: Math.max(1, Math.min(12, parseInt(String(vrColumns.desktop)) || 3)),
        wide: Math.max(1, Math.min(12, parseInt(String(vrColumns.wide)) || 3)),
      };

      const { error } = await supabase
        .from("site_settings")
        .upsert({ 
          key: "gallery_columns", 
          value: validatedColumns,
          updated_at: new Date().toISOString()
        });

      const { error: radiusError } = await supabase
        .from("site_settings")
        .upsert({ 
          key: "gallery_image_radius", 
          value: Math.max(0, Math.min(100, parseInt(String(borderRadius)) || 0)),
          updated_at: new Date().toISOString()
        });

      await supabase
        .from("site_settings")
        .upsert({ 
          key: "gallery_image_border_width", 
          value: Math.max(0, Math.min(20, parseInt(String(borderWidth)) || 0)),
          updated_at: new Date().toISOString()
        });

      await supabase
        .from("site_settings")
        .upsert({ 
          key: "gallery_image_border_color", 
          value: borderColor || "#ffffff",
          updated_at: new Date().toISOString()
        });

      await supabase
        .from("site_settings")
        .upsert({ 
          key: "gallery_bg_light", 
          value: bgLight || "#ffffff",
          updated_at: new Date().toISOString()
        });

      await supabase
        .from("site_settings")
        .upsert({ 
          key: "gallery_bg_dark", 
          value: bgDark || "#09090b",
          updated_at: new Date().toISOString()
        });

      const heroSettings = [
        { key: "hero_heading", value: heroHeading },
        { key: "hero_subheader", value: heroSubheader },
        { key: "hero_description", value: heroDescription },
        { key: "hero_heading_color", value: heroHeadingColor },
        { key: "hero_subheader_color", value: heroSubheaderColor },
        { key: "hero_description_color", value: heroDescriptionColor },
         { key: "hero_heading_size", value: heroHeadingSize },
        { key: "hero_subheader_size", value: heroSubheaderSize },
        { key: "hero_description_size", value: heroDescriptionSize },
        { key: "hero_heading_size_mobile", value: heroHeadingSizeMobile },
        { key: "hero_subheader_size_mobile", value: heroSubheaderSizeMobile },
        { key: "hero_description_size_mobile", value: heroDescriptionSizeMobile },
      ];

      for (const setting of heroSettings) {
        await supabase
          .from("site_settings")
          .upsert({ ...setting, updated_at: new Date().toISOString() });
      }
      
      if (error || radiusError) throw error || radiusError;

      await supabase
        .from("site_settings")
        .upsert({ 
          key: "gallery_shuffle", 
          value: isShuffled,
          updated_at: new Date().toISOString()
        });

      await supabase
        .from("site_settings")
        .upsert({ 
          key: "gallery_items_per_page", 
          value: Math.max(1, parseInt(String(itemsPerPage)) || 50),
          updated_at: new Date().toISOString()
        });

      await supabase
        .from("site_settings")
        .upsert({ 
          key: "vr_columns", 
          value: validatedVrColumns,
          updated_at: new Date().toISOString()
        });
      
      await supabase
        .from("site_settings")
        .upsert({ 
          key: "gallery_initial_items", 
          value: Math.max(1, parseInt(String(initialItems)) || 50),
          updated_at: new Date().toISOString()
        });
      
      // Update local state with validated values
      setColumns(validatedColumns);
      setVrColumns(validatedVrColumns);
      setBorderRadius(Math.max(0, Math.min(100, parseInt(String(borderRadius)) || 0)));
      setBorderWidth(Math.max(0, Math.min(20, parseInt(String(borderWidth)) || 0)));
      setBorderColor(borderColor || "#ffffff");
      setBgLight(bgLight || "#ffffff");
      setBgDark(bgDark || "#09090b");
      setItemsPerPage(Math.max(1, parseInt(String(itemsPerPage)) || 50));
      setInitialItems(Math.max(1, parseInt(String(initialItems)) || 50));

      toast.success("설정이 저장되었습니다.");
    } catch (e) {
      console.error("Settings save failed:", e);
      toast.error("설정 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateColumn = (key: string, value: string) => {
    setColumns((prev: GalleryColumnState) => ({ ...prev, [key]: value }));
  };

  const updateVRColumn = (key: string, value: string) => {
    setVrColumns((prev: GalleryColumnState) => ({ ...prev, [key]: value }));
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
                      value={columns.mobile}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        updateColumn("mobile", val);
                      }}
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
                      태블릿 (768px ~ 1024px)
                    </label>
                    <Input
                      value={columns.tablet}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        updateColumn("tablet", val);
                      }}
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
                      데스크탑 (1280px ~ 1536px)
                    </label>
                    <Input
                      value={columns.desktop}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        updateColumn("desktop", val);
                      }}
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
                      와이드 (1536px 이상)
                    </label>
                    <Input
                      value={columns.wide}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        updateColumn("wide", val);
                      }}
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

        {/* VR 그리드 설정 */}
        <Card className="rounded-none border-border bg-card overflow-hidden">
          <CardHeader className="p-8 border-b border-border bg-secondary/20">
            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-foreground">
              <LayoutGrid size={24} className="text-primary" />
              VR 그리드 설정
            </CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">VR 아카이브 페이지의 화면 크기별 카드 배열을 설정합니다.</CardDescription>
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
                      모바일
                    </label>
                    <Input
                      value={vrColumns.mobile}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        updateVRColumn("mobile", val);
                      }}
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
                      태블릿
                    </label>
                    <Input
                      value={vrColumns.tablet}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        updateVRColumn("tablet", val);
                      }}
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
                      데스크탑
                    </label>
                    <Input
                      value={vrColumns.desktop}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        updateVRColumn("desktop", val);
                      }}
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
                      와이드
                    </label>
                    <Input
                      value={vrColumns.wide}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        updateVRColumn("wide", val);
                      }}
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
                    VR 설정 저장
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 갤러리 표시 설정 */}
        <Card className="rounded-none border-border bg-card overflow-hidden">
          <CardHeader className="p-8 border-b border-border bg-secondary/20">
            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-foreground">
              <Shuffle size={24} className="text-primary" />
              갤러리 표시 설정
            </CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">
              이미지 표시 순서를 설정합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-bold">이미지 셔플</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  활성화하면 갤러리 이미지가 랜덤 순서로 표시됩니다.
                </p>
              </div>
              <button
                onClick={() => setIsShuffled(!isShuffled)}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                  isShuffled ? "bg-primary" : "bg-secondary border border-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
                    isShuffled ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-border/50 mt-6">
              <div className="space-y-1">
                <p className="text-sm font-bold">페이지당 이미지 개수</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  기본값 50. 초기 로딩 및 추가 로딩 시 가져올 이미지 개수를 설정합니다.
                </p>
              </div>
              <div className="w-32">
                <Input
                  value={itemsPerPage}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setItemsPerPage(val);
                  }}
                  className="h-10 rounded-lg text-right font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-border/50 mt-6">
              <div className="space-y-1">
                <p className="text-sm font-bold">초기 로딩 이미지 개수</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  페이지 첫 접속 시 불러올 이미지 개수를 설정합니다.
                </p>
              </div>
              <div className="w-32">
                <Input
                  value={initialItems}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setInitialItems(val);
                  }}
                  className="h-10 rounded-lg text-right font-mono"
                />
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
                표시 설정 저장
              </Button>
            </div>
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-4 px-4 py-6 bg-secondary/10 border border-border/50">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-foreground uppercase tracking-widest">
                    모서리 곡률 (PX)
                  </label>
                  <span className="text-[10px] font-mono opacity-50">{borderRadius}px</span>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    value={borderRadius}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setBorderRadius(val);
                    }}
                    className="h-10 rounded-none bg-background border-border/50 text-right font-mono"
                    placeholder="0"
                  />
                  <div 
                    className="h-10 w-10 shrink-0 bg-primary transition-all duration-300 border border-border"
                    style={{ borderRadius: `${parseInt(String(borderRadius)) || 0}px` }}
                  />
                </div>
              </div>

              <div className="space-y-4 px-4 py-6 bg-secondary/10 border border-border/50">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-foreground uppercase tracking-widest">
                    보더 두께 (PX)
                  </label>
                  <span className="text-[10px] font-mono opacity-50">{borderWidth}px</span>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    value={borderWidth}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setBorderWidth(val);
                    }}
                    className="h-10 rounded-none bg-background border-border/50 text-right font-mono"
                    placeholder="0"
                  />
                  <div 
                    className="h-10 w-10 shrink-0 bg-background transition-all duration-300 border-primary"
                    style={{ borderWidth: `${parseInt(String(borderWidth)) || 0}px` }}
                  />
                </div>
              </div>

              <div className="space-y-4 px-4 py-6 bg-secondary/10 border border-border/50">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-foreground uppercase tracking-widest">
                    보더 컬러
                  </label>
                  <span className="text-[10px] font-mono opacity-50 uppercase">{borderColor}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Input
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="h-10 rounded-none bg-background border-border/50 pl-10 font-mono text-sm uppercase"
                      placeholder="#FFFFFF"
                    />
                    <div 
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: borderColor }}
                    />
                  </div>
                  <Input 
                    type="color"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer overflow-hidden"
                  />
                </div>
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

        {/* 히어로 헤더 설정 */}
        <Card className="rounded-none border-border bg-card overflow-hidden">
          <CardHeader className="p-8 border-b border-border bg-secondary/20">
            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-foreground">
              <Settings size={24} className="text-primary" />
              히어로 헤더 설정
            </CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">
              메인 페이지 최상단 히어로 섹션의 문구와 스타일을 관리합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-12">
            {/* Heading */}
            <div className="space-y-6">
              <div className="pb-2 border-b border-border/50">
                <h3 className="text-sm font-black uppercase tracking-widest text-primary">메인 타이틀 (Heading)</h3>
              </div>
               <div className="grid gap-6 md:grid-cols-4">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">내용</label>
                  <Input value={heroHeading} onChange={(e) => setHeroHeading(e.target.value)} className="h-12 rounded-none font-medium" placeholder="WE VISUALIZE THE UNBUILT" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">데스크탑 크기</label>
                  <Input value={heroHeadingSize} onChange={(e) => setHeroHeadingSize(e.target.value)} className="h-12 rounded-none font-mono" placeholder="예: 80px" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">모바일 크기</label>
                  <Input value={heroHeadingSizeMobile} onChange={(e) => setHeroHeadingSizeMobile(e.target.value)} className="h-12 rounded-none font-mono" placeholder="예: 32px" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">글자 색상</label>
                  <div className="flex gap-2">
                    <Input value={heroHeadingColor} onChange={(e) => setHeroHeadingColor(e.target.value)} className="h-12 rounded-none font-mono uppercase" placeholder="#FFFFFF (기본)" />
                    <Input type="color" value={heroHeadingColor || "#ffffff"} onChange={(e) => setHeroHeadingColor(e.target.value)} className="w-12 h-12 p-0 border-none bg-transparent cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>

            {/* Subheader */}
            <div className="space-y-6">
              <div className="pb-2 border-b border-border/50">
                <h3 className="text-sm font-black uppercase tracking-widest text-primary">상단 보조 문구 (Subheader)</h3>
              </div>
               <div className="grid gap-6 md:grid-cols-4">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">내용</label>
                  <Input value={heroSubheader} onChange={(e) => setHeroSubheader(e.target.value)} className="h-12 rounded-none font-medium" placeholder="CAPTURING ALL THE ESSENCE" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">데스크탑 크기</label>
                  <Input value={heroSubheaderSize} onChange={(e) => setHeroSubheaderSize(e.target.value)} className="h-12 rounded-none font-mono" placeholder="예: 14px" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">모바일 크기</label>
                  <Input value={heroSubheaderSizeMobile} onChange={(e) => setHeroSubheaderSizeMobile(e.target.value)} className="h-12 rounded-none font-mono" placeholder="예: 10px" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">글자 색상</label>
                  <div className="flex gap-2">
                    <Input value={heroSubheaderColor} onChange={(e) => setHeroSubheaderColor(e.target.value)} className="h-12 rounded-none font-mono uppercase" placeholder="#FFFFFF (기본)" />
                    <Input type="color" value={heroSubheaderColor || "#ffffff"} onChange={(e) => setHeroSubheaderColor(e.target.value)} className="w-12 h-12 p-0 border-none bg-transparent cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-6">
              <div className="pb-2 border-b border-border/50">
                <h3 className="text-sm font-black uppercase tracking-widest text-primary">하단 설명 문구 (Description)</h3>
              </div>
               <div className="grid gap-6 md:grid-cols-4">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">내용</label>
                  <Input value={heroDescription} onChange={(e) => setHeroDescription(e.target.value)} className="h-12 rounded-none font-medium" placeholder="ARCHITECTURAL VISUALIZATION STUDIO" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">데스크탑 크기</label>
                  <Input value={heroDescriptionSize} onChange={(e) => setHeroDescriptionSize(e.target.value)} className="h-12 rounded-none font-mono" placeholder="예: 16px" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">모바일 크기</label>
                  <Input value={heroDescriptionSizeMobile} onChange={(e) => setHeroDescriptionSizeMobile(e.target.value)} className="h-12 rounded-none font-mono" placeholder="예: 11px" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">글자 색상</label>
                  <div className="flex gap-2">
                    <Input value={heroDescriptionColor} onChange={(e) => setHeroDescriptionColor(e.target.value)} className="h-12 rounded-none font-mono uppercase" placeholder="기본값" />
                    <Input type="color" value={heroDescriptionColor || "#ffffff"} onChange={(e) => setHeroDescriptionColor(e.target.value)} className="w-12 h-12 p-0 border-none bg-transparent cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-8 border-t border-border">
              <Button onClick={handleSave} disabled={isSaving} className="rounded-none px-10 h-12 font-black uppercase tracking-widest text-[11px] transition-all duration-500">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4 stroke-3" />}
                히어로 설정 저장
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 전체 테마 설정 */}
        <Card className="rounded-none border-border bg-card overflow-hidden">
          <CardHeader className="p-8 border-b border-border bg-secondary/20">
            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3 text-foreground">
              <Settings size={24} className="text-primary" />
              전체 테마 설정
            </CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">
              사이트의 전체 배경색 및 테마 스타일을 설정합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4 px-4 py-6 bg-secondary/10 border border-border/50">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-foreground uppercase tracking-widest">
                    라이트 모드 배경색
                  </label>
                  <span className="text-[10px] font-mono opacity-50 uppercase">{bgLight}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Input
                      value={bgLight}
                      onChange={(e) => setBgLight(e.target.value)}
                      className="h-10 rounded-none bg-background border-border/50 pl-10 font-mono text-sm uppercase"
                      placeholder="#FFFFFF"
                    />
                    <div 
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: bgLight }}
                    />
                  </div>
                  <Input 
                    type="color"
                    value={bgLight}
                    onChange={(e) => setBgLight(e.target.value)}
                    className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer overflow-hidden"
                  />
                </div>
              </div>

              <div className="space-y-4 px-4 py-6 bg-secondary/10 border border-border/50">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-foreground uppercase tracking-widest">
                    다크 모드 배경색
                  </label>
                  <span className="text-[10px] font-mono opacity-50 uppercase">{bgDark}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Input
                      value={bgDark}
                      onChange={(e) => setBgDark(e.target.value)}
                      className="h-10 rounded-none bg-background border-border/50 pl-10 font-mono text-sm uppercase"
                      placeholder="#09090B"
                    />
                    <div 
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: bgDark }}
                    />
                  </div>
                  <Input 
                    type="color"
                    value={bgDark}
                    onChange={(e) => setBgDark(e.target.value)}
                    className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer overflow-hidden"
                  />
                </div>
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
                테마 저장
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

