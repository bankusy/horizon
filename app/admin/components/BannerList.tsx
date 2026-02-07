"use client";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Banner {
  id: string;
  title: string;
  description: string;
  src: string;
  display_order: number;
}

export function BannerList({ banners, onDelete }: { banners: Banner[], onDelete?: (id: string) => void }) {

  const handleDelete = async (id: string, src: string) => {
    try {
      // 1. Delete from DB
      const { error: dbError } = await supabase
        .from("banners")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      // 2. Delete from Storage (Optional but recommended)
      const fileName = src.split("/").pop();
      if (fileName) {
        await supabase.storage
          .from("images")
          .remove([`banners/${fileName}`]);
      }

      toast.success("배너가 정상적으로 삭제되었습니다.");

      if (onDelete) onDelete(id);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "배너 삭제 중 오류가 발생했습니다.");
    }
  };

  if (banners.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
        <AlertCircle size={40} className="mb-4 opacity-20" />
        <p className="text-sm font-medium">등록된 메인 배너가 없습니다.</p>
        <p className="text-xs">상단의 폼을 이용해 첫 배너를 등록해 보세요.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
      {banners.map((banner) => (
        <div key={banner.id} className="group relative bg-white rounded-2xl border border-zinc-200 overflow-hidden   transition-all duration-300">
          <div className="aspect-video w-full overflow-hidden bg-zinc-100">
            <img src={banner.src} alt={banner.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
          <div className="p-5 pr-14">
            <h3 className="text-lg font-bold text-zinc-900 truncate mb-1">{banner.title}</h3>
            <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">{banner.description}</p>
          </div>

          <div className="absolute top-4 right-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="icon" variant="destructive" className="h-10 w-10 rounded-full opacity-0 group-hover:opacity-100 transition-all ">
                  <Trash2 size={18} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>배너를 삭제하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    이 작업은 되돌릴 수 없습니다. 홈페이지에서 해당 배너가 즉시 제거됩니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">취소</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(banner.id, banner.src)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
                    삭제
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  );
}
