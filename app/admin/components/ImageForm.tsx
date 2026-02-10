"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import imageCompression from "browser-image-compression";
import { Loader2, Upload, X, CheckCircle2, AlertCircle, Image as ImageIcon } from "lucide-react";

interface Category {
  id: string;
  name: string;
  display_order: number;
}

interface PendingUpload {
  id: string;
  file: File;
  title: string;
  categoryId: string; // category_id로 변경
  videoUrl?: string;
  aspectRatio: number;
  width: number;
  height: number;
  displayOrder: number;
  status: "pending" | "compressing" | "uploading" | "completed" | "error";
  error?: string;
  previewUrl: string;
}

export function ImageForm({ onAdd }: { onAdd?: (data: { id: string; title: string; src: string; category_id: string; category_name?: string; video_url?: string; aspect_ratio: number; display_order: number }) => void }) {
  const [uploads, setUploads] = useState<PendingUpload[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // 카테고리 목록 로드
  useEffect(() => {
    async function fetchCategories() {
      if (!supabase) return;
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });
      if (data) {
        setCategories(data);
        // 기본값 설정 (첫 번째 카테고리)
        if (data.length > 0) {
            // 새로 추가되는 업로드 항목의 기본값을 위해 별도 상태 관리가 필요할 수 있으나,
            // 여기서는 categories 로드 시점에만 체크. 
            // 실제 개별 업로드 아이템 생성 시점에도 적용해야 함.
        }
      }
    }
    fetchCategories();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => file.type.startsWith("image/"));
      
      if (validFiles.length < files.length) {
        toast.error("일부 파일이 이미지가 아니어서 제외되었습니다.");
      }

      const newUploadsPromises = validFiles.map(async file => {
        // 이미지 크기 및 비율 계산
        const { width, height, aspectRatio } = await new Promise<{ width: number; height: number; aspectRatio: number }>((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ 
              width: img.width, 
              height: img.height, 
              aspectRatio: img.width / img.height 
            });
            img.onerror = () => resolve({ width: 0, height: 0, aspectRatio: 1.0 });
            img.src = URL.createObjectURL(file);
        });

        return {
            id: Math.random().toString(36).substring(7),
            file,
            title: file.name.split('.').slice(0, -1).join('.') || "제목 없음",
            title: file.name.split('.').slice(0, -1).join('.') || "제목 없음",
            categoryId: categories.length > 0 ? categories[0].id : "", // 첫 번째 카테고리 기본 선택
            aspectRatio,
            width,
            height,
            displayOrder: 0,
            status: "pending" as const,
            previewUrl: URL.createObjectURL(file),
        };
      });

      Promise.all(newUploadsPromises).then(newUploads => {
          setUploads(prev => [...prev, ...newUploads]);
      });
      
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeUpload = (id: string) => {
    setUploads(prev => {
      const target = prev.find(u => u.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter(u => u.id !== id);
    });
  };

  const updateMetadata = (id: string, updates: Partial<Pick<PendingUpload, "title" | "categoryId" | "videoUrl" | "displayOrder">>) => {
    setUploads(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const clearAll = () => {
    uploads.forEach(u => URL.revokeObjectURL(u.previewUrl));
    setUploads([]);
  };

  const startBulkUpload = async () => {
    if (uploads.length === 0) return;
    if (!supabase) {
        toast.error("Supabase 설정이 필요합니다. .env.local 파일을 확인해주세요.");
        return;
    }

    setIsProcessing(true);
    const pendingItems = uploads.filter(u => u.status !== "completed");

    // 최댓값 조회 로직 (가장 뒷번호 다음에 추가)
    let maxOrder = 0;
    try {
        const { data: maxOrderData, error: maxOrderError } = await supabase
            .from("gallery")
            .select("display_order")
            .order("display_order", { ascending: false })
            .limit(1)
            .maybeSingle();
        
        if (!maxOrderError && maxOrderData) {
            maxOrder = maxOrderData.display_order || 0;
        }
    } catch (e) {
        console.error("Max order fetch failed:", e);
    }

    let currentOrder = maxOrder;

    for (const item of pendingItems) {
      currentOrder += 1; // 순서값을 1씩 증가시켜 양수로 유지
      // Update status to compressing
      setUploads(prev => prev.map(u => u.id === item.id ? { ...u, status: "compressing" } : u));

      try {
        // 1. WebP 압축 (이미지당 200kb 제한 최적화)
        const compressionOptions = {
          maxSizeMB: 0.2, // 1MB -> 200kb로 대폭 최적화
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: "image/webp" as const,
          initialQuality: 0.8,
        };
        const compressedFile = await imageCompression(item.file, compressionOptions);

        // 2. 업로드 중으로 상태 변경
        setUploads(prev => prev.map(u => u.id === item.id ? { ...u, status: "uploading" } : u));

        const fileExt = "webp";
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `gallery/${fileName}`;

        const { data, error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, compressedFile);

        if (uploadError) throw uploadError;

        // 3. 퍼블릭 URL 가져오기
        const { data: { publicUrl } } = supabase.storage
          .from("images")
          .getPublicUrl(filePath);

        // 4. Database에 메타데이터 저장
        const { data: dbData, error: dbError } = await supabase
          .from("gallery")
          .insert([
            {
              title: item.title,
              src: publicUrl,
              category_id: item.categoryId || null, // 빈 문자열이면 null
              video_url: item.videoUrl || null,
              type: item.videoUrl ? "video" : "image",
              aspect_ratio: item.aspectRatio,
              width: item.width,
              height: item.height,
              display_order: currentOrder, // 자동 부여된 순서 사용
            }
          ])
          .select()
          .single();

        if (dbError) throw dbError;

        // 5. 상위 컴포넌트에 알림 및 상태 변경
        if (onAdd && dbData) {
          const categoryName = categories.find(c => c.id === dbData.category_id)?.name;
          onAdd({
            id: dbData.id,
            title: dbData.title,
            src: dbData.src,
            category_id: dbData.category_id,
            category_name: categoryName,
            video_url: dbData.video_url,
            aspect_ratio: dbData.aspect_ratio,
            display_order: dbData.display_order,
          });
        }

        setUploads(prev => prev.map(u => u.id === item.id ? { ...u, status: "completed" } : u));
      } catch (error: any) {
        console.error(`Upload failed for ${item.title}:`, error);
        setUploads(prev => prev.map(u => u.id === item.id ? { ...u, status: "error", error: error.message } : u));
      }
    }

    setIsProcessing(false);
    toast.success("업로드 프로세스가 종료되었습니다.");
  };

  const allCompleted = uploads.length > 0 && uploads.every(u => u.status === "completed");

  return (
    <Card className="border-none">
      <CardHeader className="px-6 pt-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold">이미지 일괄 등록</CardTitle>
            <CardDescription>여러 개의 작품을 한 번에 아카이브에 등록합니다.</CardDescription>
          </div>
          {uploads.length > 0 && (
            <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAll}
                disabled={isProcessing}
                className="text-xs h-8 border-dashed"
            >
              목록 비우기
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="space-y-6">
          {/* File Selector Zone */}
          <div className="relative group">
            <input
              type="file"
              multiple
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleFileChange}
              disabled={isProcessing}
              ref={fileInputRef}
            />
            <div className={`
              border-2 border-dashed rounded-none p-8 transition-all duration-300 flex flex-col items-center justify-center gap-3
              ${isProcessing ? "bg-muted/50 border-border" : "bg-muted/20 border-border group-hover:border-primary/50 group-hover:bg-muted/30"}
            `}>
              <div className="w-12 h-12 rounded-none bg-background flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors border border-border">
                <Upload size={24} />
              </div>
              <div className="text-center">
                <p className="text-[11px] font-bold uppercase tracking-widest text-foreground">클릭하거나 파일을 여기로 드래그하세요</p>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tight">다중 선택 가능 (JPG, PNG, WebP 등)</p>
              </div>
            </div>
          </div>

          {/* Upload List */}
          {uploads.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">선택된 이미지 ({uploads.length})</h3>
              </div>
              <div className="grid gap-3">
                {uploads.map((u) => (
                  <div key={u.id} className="relative bg-card border border-border rounded-none p-3 flex gap-4 items-center group overflow-hidden">
                    {/* Status Overlay for completion */}
                    {u.status === "completed" && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center z-20">
                            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
                                <CheckCircle2 size={16} />
                                업로드 완료
                            </div>
                        </div>
                    )}

                    {/* Preview Thumbnail */}
                    <div className="relative w-40 h-40 shrink-0 rounded-none overflow-hidden bg-muted border border-border ">
                      <img src={u.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      {isProcessing && (u.status === "compressing" || u.status === "uploading") && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Loader2 size={24} className="text-white animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Metadata Inputs */}
                    <div className="flex-1 grid grid-cols-1 gap-4 py-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">이미지 제목</label>
                        <Input
                          value={u.title}
                          onChange={(e) => updateMetadata(u.id, { title: e.target.value })}
                          className="h-10 text-sm rounded-none border-border focus:border-primary focus:ring-0 transition-all font-medium bg-background"
                          placeholder="작품 제목을 입력하세요"
                          disabled={isProcessing || u.status === "completed"}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">유튜브 링크 (선택 사항)</label>
                        <Input
                          value={u.videoUrl || ""}
                          onChange={(e) => updateMetadata(u.id, { videoUrl: e.target.value })}
                          className="h-10 text-sm rounded-none border-border focus:border-primary focus:ring-0 transition-all font-medium bg-background"
                          placeholder="https://www.youtube.com/watch?v=..."
                          disabled={isProcessing || u.status === "completed"}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">카테고리 설정</label>
                        <Select
                          value={u.categoryId}
                          onValueChange={(val) => updateMetadata(u.id, { categoryId: val })}
                          disabled={isProcessing || u.status === "completed"}
                        >
                          <SelectTrigger className="h-10 text-sm rounded-none bg-background border-border">
                            <SelectValue placeholder="카테고리 선택" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id} className="text-sm">{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-center justify-center gap-2 h-full">
                       {u.status === "error" ? (
                           <div title={u.error} className="text-destructive">
                               <AlertCircle size={18} />
                           </div>
                       ) : u.status !== "completed" && (
                           <Button
                             variant="ghost"
                             size="icon"
                             onClick={() => removeUpload(u.id)}
                             className="h-8 w-8 rounded-none text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                             disabled={isProcessing}
                           >
                             <X size={16} />
                           </Button>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Master Action Button */}
          {uploads.length > 0 && !allCompleted && (
            <Button
              onClick={startBulkUpload}
              disabled={isProcessing}
              className="w-full h-12 rounded-none font-bold text-[11px] uppercase tracking-[0.2em] bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  파일 처리 중...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  선택한 {uploads.filter(u => u.status !== "completed").length}개 이미지 업로드 시작
                </>
              )}
            </Button>
          )}

          {allCompleted && (
            <div className="p-4 rounded-none bg-green-50 border border-green-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-green-700">
                    <CheckCircle2 size={24} />
                    <span className="font-semibold">{uploads.length}개의 이미지 업로드 완료!</span>
                </div>
                <Button 
                    variant="ghost" 
                    onClick={clearAll}
                    className="text-green-700 hover:bg-green-100"
                >
                    확인
                </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
