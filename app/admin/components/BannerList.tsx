"use client";

import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, Image as ImageIcon, GripVertical, AlertCircle } from "lucide-react";
import { Reorder, useDragControls } from "framer-motion";
import { supabase } from "@/lib/supabase";
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

interface BannerListProps {
    banners: Banner[];
    onDelete?: (id: string) => void;
    onReorder?: (newBanners: Banner[]) => void;
    onReorderComplete?: () => void;
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
}

export function BannerList({
    banners,
    onDelete,
    onReorder,
    onReorderComplete,
    selectedIds,
    onSelectionChange,
}: BannerListProps) {
    const isAllSelected =
        banners.length > 0 && selectedIds.length === banners.length;
    const isPartialSelected =
        selectedIds.length > 0 && selectedIds.length < banners.length;

    const handleSelectAll = () => {
        if (isAllSelected) {
            onSelectionChange([]);
        } else {
            onSelectionChange(banners.map((b) => b.id));
        }
    };

    const handleSelectOne = (id: string) => {
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter((itemId) => itemId !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };

    const handleDelete = async (id: string, src: string) => {
        try {
            // 1. Delete from DB
            const { error: dbError } = await supabase
                .from("banners")
                .delete()
                .eq("id", id);

            if (dbError) throw dbError;

            // 2. Delete from Storage
            const bucketPrefix = "/storage/v1/object/public/images/";
            if (src.includes(bucketPrefix)) {
                const filePath = src.split(bucketPrefix)[1];
                if (filePath) {
                    await supabase.storage.from("images").remove([filePath]);
                }
            }

            toast.success("배너가 정상적으로 삭제되었습니다.");
            if (onDelete) onDelete(id);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "배너 삭제 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="w-full space-y-4">
            {/* Header / Toolbar - ImageList와 동일하게 맞춤 */}
            <div className="flex items-center justify-between px-6 py-3 bg-zinc-50 border border-border rounded-xl">
                <div className="flex items-center gap-4">
                    <div className="flex items-center h-5">
                        <input
                            type="checkbox"
                            checked={isAllSelected}
                            ref={(el) => {
                                if (el) el.indeterminate = isPartialSelected;
                            }}
                            onChange={handleSelectAll}
                            className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                        />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        전체 선택 ({banners.length})
                    </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tight bg-white px-3 py-1 rounded-full border border-border shadow-sm">
                    <GripVertical size={12} />
                    핸들을 드래그하여 순서 변경
                </div>
            </div>

            <Reorder.Group
                as="div"
                axis="y"
                values={banners}
                onReorder={onReorder || (() => { })}
                onDragEnd={onReorderComplete}
                className="flex flex-col gap-3 p-4 bg-zinc-50/30 rounded-xl"
            >
                {banners.map((banner) => (
                    <BannerRow
                        key={banner.id}
                        banner={banner}
                        isSelected={selectedIds.includes(banner.id)}
                        onSelectOne={handleSelectOne}
                        onDelete={handleDelete}
                    />
                ))}
            </Reorder.Group>

            {banners.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-muted-foreground bg-zinc-50/20 rounded-xl border border-dashed">
                    <ImageIcon size={40} className="mb-4 opacity-20" />
                    <p className="text-xs font-semibold uppercase tracking-widest">
                        등록된 배너가 없습니다
                    </p>
                </div>
            )}
        </div>
    );
}

interface BannerRowProps {
    banner: Banner;
    isSelected: boolean;
    onSelectOne: (id: string) => void;
    onDelete: (id: string, src: string) => void;
}

function BannerRow({ banner, isSelected, onSelectOne, onDelete }: BannerRowProps) {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={banner}
            id={banner.id}
            dragListener={false}
            dragControls={controls}
            as="div"
            layout
            initial={false}
            animate={{
                scale: 1,
                boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                zIndex: 1,
                backgroundColor: isSelected ? "rgb(244 244 245 / 0.5)" : "white"
            }}
            whileDrag={{
                scale: 1.02,
                boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                zIndex: 50,
                backgroundColor: "white",
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`flex items-center gap-4 p-3 rounded-xl border border-border shadow-sm group transition-colors hover:border-zinc-300 ${isSelected ? "border-zinc-900" : ""}`}
        >
            <div
                className="cursor-grab active:cursor-grabbing p-2 hover:bg-zinc-100 rounded-lg transition-colors shrink-0"
                onPointerDown={(e) => controls.start(e)}
            >
                <GripVertical size={18} className="text-zinc-400" />
            </div>

            <div className="flex items-center shrink-0">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelectOne(banner.id)}
                    className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                />
            </div>

            <div className="relative w-20 h-10 overflow-hidden rounded-lg bg-zinc-100 border border-border shrink-0">
                <img
                    src={banner.src}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="text-sm font-bold text-zinc-900 truncate uppercase tracking-tight">
                    {banner.title}
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter tabular-nums">
                        ORDER #{banner.display_order} • {banner.description?.slice(0, 30)}...
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-white border border-transparent hover:border-border"
                    asChild
                >
                    <a href={banner.src} target="_blank" rel="noreferrer">
                        <ExternalLink size={14} className="text-zinc-500" />
                    </a>
                </Button>
                
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-destructive hover:text-white hover:bg-destructive border border-transparent hover:border-destructive"
                        >
                            <Trash2 size={14} />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle>배너를 삭제하시겠습니까?</AlertDialogTitle>
                            <AlertDialogDescription>
                                이 작업은 되돌릴 수 없습니다. 홈페이지 슬라이더에서 즉시 제거됩니다.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl font-bold">취소</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(banner.id, banner.src)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-bold">
                                삭제
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Reorder.Item>
    );
}
