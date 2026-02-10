"use client";

import { useState, useEffect } from "react";
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
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Trash2, Youtube, ExternalLink } from "lucide-react";

interface Category {
  id: string;
  name: string;
  display_order: number;
}

interface PendingVideo {
  id: string;
  title: string;
  videoUrl: string;
  categoryId: string;
  thumbnailUrl: string;
}

// YouTube URL에서 비디오 ID 추출
function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// YouTube 썸네일 URL 생성
function getYoutubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export function VideoForm({ onAdd }: { onAdd?: (data: { id: string; title: string; src: string; category_id: string; category_name?: string; video_url: string; type: string; display_order: number }) => void }) {
  const [videos, setVideos] = useState<PendingVideo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState("");

  // 카테고리 목록 로드
  useEffect(() => {
    async function fetchCategories() {
      if (!supabase) return;
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });
      if (data) setCategories(data);
    }
    fetchCategories();
  }, []);

  // URL 입력 시 비디오 추가
  const handleAddVideo = () => {
    const videoId = extractYoutubeId(newVideoUrl);
    if (!videoId) {
      toast.error("올바른 YouTube URL을 입력해주세요.");
      return;
    }

    const thumbnailUrl = getYoutubeThumbnail(videoId);
    
    setVideos(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      title: "",
      videoUrl: newVideoUrl,
      categoryId: "",
      thumbnailUrl,
    }]);
    
    setNewVideoUrl("");
  };

  const removeVideo = (id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  const updateVideo = (id: string, updates: Partial<PendingVideo>) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const handleUploadAll = async () => {
    if (!supabase) {
      toast.error("Supabase 설정이 필요합니다.");
      return;
    }

    const pendingItems = videos.filter(v => v.title && v.videoUrl);
    if (pendingItems.length === 0) {
      toast.error("등록할 영상이 없습니다. 제목을 입력해주세요.");
      return;
    }

    setIsProcessing(true);

    // 최댓값 조회
    let maxOrder = 0;
    try {
      const { data: maxOrderData } = await supabase
        .from("gallery")
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (maxOrderData) {
        maxOrder = maxOrderData.display_order || 0;
      }
    } catch (e) {
      console.error("Max order fetch failed:", e);
    }

    let currentOrder = maxOrder;

    for (const item of pendingItems) {
      currentOrder += 1;

      try {
        const { data: dbData, error: dbError } = await supabase
          .from("gallery")
          .insert([
            {
              title: item.title,
              src: item.thumbnailUrl, // YouTube 썸네일을 src로 사용
              category_id: item.categoryId || null,
              video_url: item.videoUrl,
              type: "video",
              aspect_ratio: 16 / 9, // YouTube 기본 비율
              display_order: currentOrder,
            }
          ])
          .select()
          .single();

        if (dbError) throw dbError;

        if (onAdd && dbData) {
          const categoryName = categories.find(c => c.id === dbData.category_id)?.name;
          onAdd({
            id: dbData.id,
            title: dbData.title,
            src: dbData.src,
            category_id: dbData.category_id,
            category_name: categoryName,
            video_url: dbData.video_url,
            type: dbData.type,
            display_order: dbData.display_order,
          });
        }

        toast.success(`"${item.title}" 영상이 등록되었습니다.`);
      } catch (error: any) {
        console.error("Video upload error:", error);
        toast.error(`"${item.title}" 등록 실패: ${error.message}`);
      }
    }

    setVideos([]);
    setIsProcessing(false);
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Youtube size={18} />
          영상 URL 등록
        </CardTitle>
        <CardDescription>YouTube 영상 URL을 입력하여 갤러리에 추가합니다. 썸네일이 자동으로 추출됩니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* URL 입력 영역 */}
        <div className="flex gap-3">
          <Input
            placeholder="YouTube URL 입력 (예: https://youtu.be/...)"
            value={newVideoUrl}
            onChange={(e) => setNewVideoUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddVideo()}
            className="flex-1 h-10 rounded-none border-border bg-background"
          />
          <Button onClick={handleAddVideo} variant="outline" className="h-10 rounded-none px-6 font-bold uppercase text-[10px] tracking-widest border-border">
            <Plus size={16} className="mr-2" />
            추가
          </Button>
        </div>

        {/* 영상 리스트 */}
        {videos.length > 0 && (
          <div className="space-y-4">
            {videos.map((video) => (
              <div key={video.id} className="flex gap-4 p-4 border border-border rounded-none bg-muted/20">
                {/* 썸네일 미리보기 */}
                <div className="w-32 h-18 rounded-none overflow-hidden bg-muted shrink-0 border border-border">
                  <img 
                    src={video.thumbnailUrl} 
                    alt="썸네일" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${extractYoutubeId(video.videoUrl)}/hqdefault.jpg`;
                    }}
                  />
                </div>

                {/* 메타데이터 입력 */}
                <div className="flex-1 space-y-3">
                  <Input
                    placeholder="영상 제목"
                    value={video.title}
                    onChange={(e) => updateVideo(video.id, { title: e.target.value })}
                    className="h-10 rounded-none border-border bg-background text-sm font-medium"
                  />
                  <div className="flex gap-3">
                    <Select
                      value={video.categoryId}
                      onValueChange={(val) => updateVideo(video.id, { categoryId: val })}
                    >
                      <SelectTrigger className="h-10 rounded-none flex-1 border-border bg-background text-sm">
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} className="text-sm">{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <a 
                      href={video.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="h-10 px-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVideo(video.id)}
                      className="h-10 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* 일괄 등록 버튼 */}
            <div className="flex justify-end pt-4 border-t border-border">
              <Button 
                onClick={handleUploadAll} 
                disabled={isProcessing || videos.length === 0}
                className="rounded-none px-10 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase text-[10px] tracking-[0.2em]"
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Youtube className="mr-2 h-4 w-4" />
                )}
                {videos.length}개 영상 등록
              </Button>
            </div>
          </div>
        )}

        {videos.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <Youtube size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">YouTube URL을 입력하여 영상을 추가하세요</p>
          </div>
        )}
      </CardContent>
    </>
  );
}
