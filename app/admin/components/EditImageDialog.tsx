"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Category {
    id: string;
    name: string;
}

interface EditImageDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string | number, updates: { title: string; category_id: string; display_order: number }) => Promise<void>;
    image: {
        id: string | number;
        alt: string;
        category_id: string;
        display_order: number;
        src: string;
    } | null;
}

export function EditImageDialog({
    isOpen,
    onClose,
    onSave,
    image,
}: EditImageDialogProps) {
    const [title, setTitle] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [displayOrder, setDisplayOrder] = useState<number>(0);
    const [isSaving, setIsSaving] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    // 카테고리 목록 로드
    useEffect(() => {
        async function fetchCategories() {
            if (!supabase) return;
            const { data } = await supabase
                .from("categories")
                .select("id, name")
                .order("display_order", { ascending: true });
            if (data) setCategories(data);
        }
        fetchCategories();
    }, []);

    useEffect(() => {
        if (image) {
            setTitle(image.alt);
            setCategoryId(image.category_id);
            setDisplayOrder(image.display_order || 0);
        }
    }, [image]);

    const handleSave = async () => {
        if (!image) return;
        setIsSaving(true);
        try {
            await onSave(image.id, { title, category_id: categoryId, display_order: displayOrder });
            onClose();
        } catch (error) {
            console.error("Failed to save:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!image) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] rounded-0 border-border p-0 overflow-hidden bg-background">
                <DialogHeader className="p-5 bg-muted/20 border-b border-border">
                    <DialogTitle className="text-lg font-bold tracking-tight">이미지 정보 수정</DialogTitle>
                </DialogHeader>
                    <div className="p-5 space-y-5">
                        <div className="relative aspect-video w-full overflow-hidden rounded-none border border-border bg-zinc-100/50">
                            <img 
                                src={image.src} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-muted-foreground uppercase opacity-40 tracking-[0.2em] ml-1">이미지 제목</label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="h-10 rounded-none border-border focus:border-primary transition-all font-medium bg-background"
                                    placeholder="제목을 입력하세요"
                                />
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-muted-foreground uppercase opacity-40 tracking-[0.2em] ml-1">카테고리</label>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger className="h-10 rounded-none bg-background border-border focus:ring-primary/20">
                                        <SelectValue placeholder="카테고리 선택" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none border-border bg-popover text-popover-foreground">
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id} className="rounded-none">
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-muted-foreground uppercase opacity-40 tracking-[0.2em] ml-1">정렬 순서 (Order)</label>
                                <Input
                                    type="number"
                                    value={displayOrder}
                                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                                    className="h-10 rounded-none border-border focus:border-primary transition-all font-medium bg-background"
                                    placeholder="0"
                                />
                                <p className="text-[9px] text-muted-foreground ml-1">숫자가 낮을수록 앞에 표시됩니다.</p>
                            </div>
                        </div>
                    </div>
                <DialogFooter className="p-4 bg-muted/20 border-t border-border flex flex-row gap-2">
                    <Button 
                        variant="ghost" 
                        onClick={onClose} 
                        className="flex-1 h-10 rounded-none font-bold text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted"
                        disabled={isSaving}
                    >
                        취소
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        className="flex-1 h-10 rounded-none font-bold text-[11px] uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
                        disabled={isSaving || !title || !categoryId}
                    >
                        {isSaving ? (
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-3.5 w-3.5" />
                        )}
                        저장하기
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
