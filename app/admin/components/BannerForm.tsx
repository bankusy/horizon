"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

export function BannerForm({ onAdd }: { onAdd?: (banner: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreview(url);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setTitle("");
    setDescription("");
  };

  const handleUpload = async () => {
    if (!file || !title) {
      toast.error("이미지와 제목은 필수 항목입니다.");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Compression (배너 이미지 200kb 제한 최적화)
      const options = {
        maxSizeMB: 0.2, // 5MB -> 200kb로 대폭 최적화
        maxWidthOrHeight: 2560,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.8,
      };
      const compressedBlob = await imageCompression(file, options);
      const compressedFile = new File([compressedBlob], `banner_${Date.now()}.webp`, {
        type: "image/webp",
      });

      // 2. Storage Upload
      const fileName = `banners/${Date.now()}_${compressedFile.name}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from("images")
        .upload(fileName, compressedFile);

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage
        .from("images")
        .getPublicUrl(fileName);

      // 3. Database Insert (새 배너를 가장 처음에 배치하기 위해 최솟값 순서 조회)
      let minOrder = 0;
      try {
        const { data: minData } = await supabase
          .from("banners")
          .select("display_order")
          .order("display_order", { ascending: true })
          .limit(1)
          .maybeSingle();
        if (minData) minOrder = minData.display_order;
      } catch (e) {}

      const { data: dbData, error: dbError } = await supabase
        .from("banners")
        .insert([
          {
            title,
            description,
            src: publicUrl,
            display_order: minOrder - 1,
          },
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      toast.success("새 배너가 등록되었습니다.");

      if (onAdd) onAdd(dbData);
      handleClear();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "배너 등록 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Preview & File Select */}
        <div className="w-full lg:w-1/2 space-y-4">
          <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">배너 이미지 (2560px 권장)</Label>
          {preview ? (
            <div className="relative aspect-video rounded-none overflow-hidden border border-border bg-muted group">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-4 right-4 p-2 bg-background/80 text-foreground border border-border rounded-none opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center aspect-video rounded-none border-2 border-dashed border-border bg-muted/20 hover:bg-muted/30 hover:border-primary/50 transition-all cursor-pointer">
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <div className="p-4 bg-background rounded-none border border-border">
                  <Upload size={32} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-foreground text-[11px] uppercase tracking-widest">클릭하여 이미지 선택</p>
                  <p className="text-[10px] uppercase tracking-tight mt-1">고화질 원본 배너 이미지를 권장합니다</p>
                </div>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          )}
        </div>

        {/* Right: Info Inputs */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">메인 제목</Label>
            <Input
              id="title"
              placeholder="예: Modern Serenity"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 text-lg font-medium rounded-none border-border bg-background focus-visible:ring-1 focus-visible:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">서브 설명</Label>
            <Textarea
              id="desc"
              placeholder="배너에 표시될 짧은 설명을 입력하세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] rounded-none border-border bg-background resize-none py-4 text-base focus-visible:ring-1 focus-visible:ring-primary/20"
            />
          </div>
          <Button
            onClick={handleUpload}
            disabled={isUploading || !file || !title}
            className="w-full h-14 rounded-none text-[11px] font-black uppercase tracking-[0.2em] bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                배너 업로드 중...
              </>
            ) : (
              "배너 등록하기"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
