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

interface EditImageDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string | number, updates: { title: string; category: string }) => Promise<void>;
    image: {
        id: string | number;
        alt: string;
        category: string;
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
    const [category, setCategory] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (image) {
            setTitle(image.alt);
            setCategory(image.category);
        }
    }, [image]);

    const handleSave = async () => {
        if (!image) return;
        setIsSaving(true);
        try {
            await onSave(image.id, { title, category });
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
            <DialogContent className="sm:max-w-[425px] rounded-2xl border-border p-0 overflow-hidden">
                <DialogHeader className="p-5 bg-zinc-50/50 border-b">
                    <DialogTitle className="text-lg font-bold tracking-tight">이미지 정보 수정</DialogTitle>
                </DialogHeader>
                    <div className="p-5 space-y-5">
                        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-zinc-100/50">
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
                                    className="h-10 rounded-lg border-zinc-200 focus:border-zinc-900 transition-all font-medium"
                                    placeholder="제목을 입력하세요"
                                />
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-muted-foreground uppercase opacity-40 tracking-[0.2em] ml-1">카테고리</label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger className="h-10 rounded-lg bg-white border-zinc-200">
                                        <SelectValue placeholder="카테고리 선택" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border">
                                        <SelectItem value="Exterior" className="rounded-lg">익스테리어 (Exterior)</SelectItem>
                                        <SelectItem value="Interior" className="rounded-lg">인테리어 (Interior)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                <DialogFooter className="p-4 bg-zinc-50/50 border-t flex flex-row gap-2">
                    <Button 
                        variant="ghost" 
                        onClick={onClose} 
                        className="flex-1 h-10 rounded-lg font-bold text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                        disabled={isSaving}
                    >
                        취소
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        className="flex-1 h-10 rounded-lg font-bold text-[11px] uppercase tracking-wider bg-zinc-900 hover:bg-black text-white"
                        disabled={isSaving || !title || !category}
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
