"use client";

import { useState, useRef } from "react";
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

interface PendingUpload {
  id: string;
  file: File;
  title: string;
  category: "Exterior" | "Interior";
  status: "pending" | "compressing" | "uploading" | "completed" | "error";
  error?: string;
  previewUrl: string;
}

export function ImageForm({ onAdd }: { onAdd?: (data: { id: string; title: string; src: string; category: string }) => void }) {
  const [uploads, setUploads] = useState<PendingUpload[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => file.type.startsWith("image/"));
      
      if (validFiles.length < files.length) {
        toast.error("일부 파일이 이미지가 아니어서 제외되었습니다.");
      }

      const newUploads: PendingUpload[] = validFiles.map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        title: file.name.split('.').slice(0, -1).join('.') || "제목 없음",
        category: "Exterior",
        status: "pending",
        previewUrl: URL.createObjectURL(file),
      }));

      setUploads(prev => [...prev, ...newUploads]);
      
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

  const updateMetadata = (id: string, updates: Partial<Pick<PendingUpload, "title" | "category">>) => {
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

    for (const item of pendingItems) {
      // Update status to compressing
      setUploads(prev => prev.map(u => u.id === item.id ? { ...u, status: "compressing" } : u));

      try {
        // 1. WebP 압축
        const compressionOptions = {
          maxSizeMB: 3,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: "image/webp" as const,
          initialQuality: 0.85,
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
              category: item.category,
            }
          ])
          .select()
          .single();

        if (dbError) throw dbError;

        // 5. 상위 컴포넌트에 알림 및 상태 변경
        if (onAdd && dbData) {
          onAdd({
            id: dbData.id,
            title: dbData.title,
            src: dbData.src,
            category: dbData.category,
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
              border-2 border-dashed rounded-xl p-8 transition-all duration-300 flex flex-col items-center justify-center gap-3
              ${isProcessing ? "bg-zinc-50 border-zinc-200" : "bg-zinc-50/50 border-zinc-200 group-hover:border-zinc-400 group-hover:bg-zinc-50"}
            `}>
              <div className="w-12 h-12 rounded-full bg-white  flex items-center justify-center text-zinc-400 group-hover:text-zinc-600 transition-colors">
                <Upload size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">클릭하거나 파일을 여기로 드래그하세요</p>
                <p className="text-xs text-muted-foreground mt-1">다중 선택 가능 (JPG, PNG, WebP 등)</p>
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
                  <div key={u.id} className="relative bg-white border border-border rounded-xl p-3 flex gap-4 items-center group overflow-hidden">
                    {/* Status Overlay for completion */}
                    {u.status === "completed" && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-20">
                            <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                                <CheckCircle2 size={16} />
                                업로드 완료
                            </div>
                        </div>
                    )}

                    {/* Preview Thumbnail */}
                    <div className="relative w-40 h-40 shrink-0 rounded-xl overflow-hidden bg-zinc-100 border border-border ">
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
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">이미지 제목</label>
                        <Input
                          value={u.title}
                          onChange={(e) => updateMetadata(u.id, { title: e.target.value })}
                          className="h-10 text-base rounded-lg border-zinc-200 focus:border-zinc-400 focus:ring-0 transition-all font-medium"
                          placeholder="작품 제목을 입력하세요"
                          disabled={isProcessing || u.status === "completed"}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">카테고리 설정</label>
                        <Select
                          value={u.category}
                          onValueChange={(val) => updateMetadata(u.id, { category: val as any })}
                          disabled={isProcessing || u.status === "completed"}
                        >
                          <SelectTrigger className="h-10 text-base rounded-lg bg-zinc-50 border-zinc-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Exterior">익스테리어 (외부 전경)</SelectItem>
                            <SelectItem value="Interior">인테리어 (내부 공간)</SelectItem>
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
                             className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
              className="w-full h-10 rounded-lg font-bold text-[11px] uppercase tracking-[0.2em] bg-zinc-900 hover:bg-zinc-800 text-white transition-all"
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
            <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex items-center justify-between gap-4">
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
