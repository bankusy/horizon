"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ExternalLink, Image as ImageIcon, AlertCircle, ChevronUp, ChevronDown } from "lucide-react";
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
import React, { useState, useEffect } from "react";

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
    onUpdateOrder?: (id: string, newOrder: number) => void;
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
}

export function BannerList({
    banners,
    onDelete,
    onUpdateOrder,
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
            <div className="flex items-center justify-between px-6 py-4 bg-card border border-border rounded-none">
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                ref={(el) => {
                                    if (el) el.indeterminate = isPartialSelected;
                                }}
                                onChange={handleSelectAll}
                                className="peer appearance-none w-5 h-5 rounded-none border border-input bg-background checked:bg-primary checked:border-primary transition-all duration-300"
                            />
                            <div className="absolute opacity-0 peer-checked:opacity-100 text-primary-foreground pointer-events-none transition-opacity duration-300">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-widest">
                            {isAllSelected ? "선택 해제" : `전체 선택 (${banners.length})`}
                        </span>
                    </label>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tight bg-secondary/50 border border-border px-4 py-1.5 rounded-none">
                    <span>순서 변경: 입력 또는 화살표 사용</span>
                </div>
            </div>

            <div className="flex flex-col gap-4 p-8 bg-secondary/10 border border-border rounded-none">
                {banners.map((banner, index) => {
                    const isFirst = index === 0;
                    const isLast = index === banners.length - 1;
                    return (
                        <BannerRow
                            key={banner.id}
                            banner={banner}
                            isSelected={selectedIds.includes(banner.id)}
                            onSelectOne={handleSelectOne}
                            onDelete={handleDelete}
                            onUpdateOrder={onUpdateOrder}
                            isFirst={isFirst}
                            isLast={isLast}
                        />
                    );
                })}
            </div>

            {banners.length === 0 && (
                <div className="py-32 flex flex-col items-center justify-center text-muted-foreground bg-secondary/20 border border-dashed border-border rounded-none">
                    <ImageIcon size={48} className="mb-4 opacity-10" />
                    <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-30">
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
    onUpdateOrder?: (id: string, newOrder: number) => void;
    isFirst: boolean;
    isLast: boolean;
}

function BannerRow({ banner, isSelected, onSelectOne, onDelete, onUpdateOrder, isFirst, isLast }: BannerRowProps) {
    const [orderInput, setOrderInput] = useState(String(banner.display_order));

    useEffect(() => {
        setOrderInput(String(banner.display_order));
    }, [banner.display_order]);

    const handleOrderBlur = () => {
        const newOrder = parseInt(orderInput, 10);
        if (!isNaN(newOrder) && newOrder !== banner.display_order && onUpdateOrder) {
            onUpdateOrder(banner.id, newOrder);
        } else {
            setOrderInput(String(banner.display_order));
        }
    };

    const handleOrderKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleOrderBlur();
        }
    };

    return (
        <div
            className={`flex items-center gap-6 p-4 rounded-none border group transition-all duration-300 ${
                isSelected ? "bg-muted/50 border-primary" : "bg-card border-border hover:border-primary/20 hover:bg-secondary/30"
            }`}
        >
            <div className="flex flex-col items-center gap-1 shrink-0 border-r border-border pr-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-none text-muted-foreground hover:text-primary disabled:opacity-20"
                    disabled={isFirst}
                    onClick={() => onUpdateOrder?.(banner.id, banner.display_order - 1)}
                >
                    <ChevronUp size={14} />
                </Button>
                <div className="relative w-12">
                     <Input
                        className="h-7 text-center p-0 text-xs font-bold rounded-none border-border focus:border-primary bg-background"
                        value={orderInput}
                        onChange={(e) => setOrderInput(e.target.value)}
                        onBlur={handleOrderBlur}
                        onKeyDown={handleOrderKeyDown}
                    />
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-none text-muted-foreground hover:text-primary disabled:opacity-20"
                    disabled={isLast}
                    onClick={() => onUpdateOrder?.(banner.id, banner.display_order + 1)}
                >
                    <ChevronDown size={14} />
                </Button>
            </div>

            <div className="flex items-center shrink-0">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelectOne(banner.id)}
                    className="w-4 h-4 rounded-none border-input bg-background checked:bg-primary checked:border-primary transition-all cursor-pointer"
                />
            </div>

            <div className="relative w-32 h-16 overflow-hidden rounded-none bg-muted border border-border shrink-0">
                <img
                    src={banner.src}
                    alt={banner.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-3">
                <span className="text-2xl font-black text-foreground truncate uppercase tracking-tight group-hover:text-primary transition-colors leading-[1.1]">
                    {banner.title}
                </span>
                <div className="flex items-center gap-4">
                    <span className="w-1.5 h-1.5 rounded-none bg-border" />
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground/20 truncate">
                        {banner.description?.slice(0, 80)}...
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 rounded-none bg-muted/50 hover:bg-primary hover:text-primary-foreground border border-transparent"
                    asChild
                >
                    <a href={banner.src} target="_blank" rel="noreferrer">
                        <ExternalLink size={14} className="mr-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest">열기</span>
                    </a>
                </Button>
                
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 rounded-none bg-muted/50 text-destructive hover:bg-destructive hover:text-destructive-foreground border border-transparent"
                        >
                            <Trash2 size={16} />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-none">
                        <AlertDialogHeader>
                            <AlertDialogTitle>배너를 삭제하시겠습니까?</AlertDialogTitle>
                            <AlertDialogDescription>
                                이 작업은 되돌릴 수 없습니다. 홈페이지 슬라이더에서 즉시 제거됩니다.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-none font-bold">취소</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(banner.id, banner.src)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-none font-bold">
                                삭제
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
