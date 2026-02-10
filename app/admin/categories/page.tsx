"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    GripVertical,
    Save,
    X,
    Eye,
    EyeOff,
} from "lucide-react";

interface Category {
    id: string;
    name: string;
    display_order: number;
    show_in_all: boolean;
    created_at: string;
    _count?: number;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    // Edit dialog state
    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null,
    );
    const [editName, setEditName] = useState("");
    const [editOrder, setEditOrder] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    // Delete confirmation
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchCategories = async () => {
        if (!supabase) return;
        setIsLoading(true);

        try {
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .order("display_order", { ascending: true });

            if (error) throw error;

            // 각 카테고리별 이미지 수 조회
            const categoriesWithCount = await Promise.all(
                (data || []).map(async (cat: Category) => {
                    const { count } = await supabase!
                        .from("gallery")
                        .select("*", { count: "exact", head: true })
                        .eq("category_id", cat.id);
                    return { ...cat, _count: count || 0 };
                }),
            );

            setCategories(categoriesWithCount);
        } catch (error: any) {
            toast.error("카테고리 로딩 실패: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = async () => {
        if (!newCategoryName.trim() || !supabase) return;
        setIsAdding(true);

        try {
            // 현재 최대 순서 조회
            const maxOrder =
                categories.length > 0
                    ? Math.max(...categories.map((c) => c.display_order))
                    : 0;

            const { data, error } = await supabase
                .from("categories")
                .insert([
                    {
                        name: newCategoryName.trim(),
                        display_order: maxOrder + 1,
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            setCategories([...categories, { ...data, _count: 0 }]);
            setNewCategoryName("");
            toast.success("카테고리가 추가되었습니다.");
        } catch (error: any) {
            if (error.code === "23505") {
                toast.error("이미 존재하는 카테고리 이름입니다.");
            } else {
                toast.error("카테고리 추가 실패: " + error.message);
            }
        } finally {
            setIsAdding(false);
        }
    };

    const handleEditOpen = (category: Category) => {
        setEditingCategory(category);
        setEditName(category.name);
        setEditOrder(category.display_order);
    };

    const handleEditSave = async () => {
        if (!editingCategory || !supabase) return;
        setIsSaving(true);

        try {
            const { error } = await supabase
                .from("categories")
                .update({ name: editName.trim(), display_order: editOrder })
                .eq("id", editingCategory.id);

            if (error) throw error;

            setCategories(
                categories
                    .map((c) =>
                        c.id === editingCategory.id
                            ? {
                                  ...c,
                                  name: editName.trim(),
                                  display_order: editOrder,
                              }
                            : c,
                    )
                    .sort((a, b) => a.display_order - b.display_order),
            );

            setEditingCategory(null);
            toast.success("카테고리가 수정되었습니다.");
        } catch (error: any) {
            if (error.code === "23505") {
                toast.error("이미 존재하는 카테고리 이름입니다.");
            } else {
                toast.error("수정 실패: " + error.message);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingCategory || !supabase) return;
        setIsDeleting(true);

        try {
            // 연결된 이미지 확인
            if (deletingCategory._count && deletingCategory._count > 0) {
                toast.error(
                    `이 카테고리에 ${deletingCategory._count}개의 이미지가 연결되어 있습니다. 먼저 이미지를 다른 카테고리로 이동하세요.`,
                );
                setIsDeleting(false);
                return;
            }

            const { error } = await supabase
                .from("categories")
                .delete()
                .eq("id", deletingCategory.id);

            if (error) throw error;

            setCategories(
                categories.filter((c) => c.id !== deletingCategory.id),
            );
            setDeletingCategory(null);
            toast.success("카테고리가 삭제되었습니다.");
        } catch (error: any) {
            toast.error("삭제 실패: " + error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-12">
            {/* Area 1: Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-8 border-b border-border">
                <div className="space-y-3">
                    <h2 className="text-5xl font-black tracking-tighter uppercase leading-none">
                        카테고리
                    </h2>
                    <p className="text-[10px] font-bold tracking-[0.3em] text-muted-foreground uppercase">
                        Gallery Content Classification
                    </p>
                </div>
            </div>

            {/* 새 카테고리 추가 */}
            <Card className="rounded-none border-border bg-card overflow-hidden">
                <CardHeader className="p-8 border-b border-border bg-secondary/20">
                    <CardTitle className="text-xl font-black uppercase tracking-tight">
                        새 카테고리 추가
                    </CardTitle>
                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">
                        갤러리에 사용할 새로운 유형을 등록합니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="flex gap-3">
                        <Input
                            placeholder="카테고리 이름 (예: Commercial)"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleAddCategory()
                            }
                            className="flex-1 h-10"
                            disabled={isAdding}
                        />
                        <Button
                            onClick={handleAddCategory}
                            disabled={!newCategoryName.trim() || isAdding}
                            className="h-10 px-6"
                        >
                            {isAdding ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    추가
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* 카테고리 목록 */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                    <h3 className="text-2xl font-black uppercase tracking-tight">
                        등록된 목록
                    </h3>
                    <span className="px-3 py-1 rounded-none bg-secondary text-[10px] font-black text-muted-foreground border border-border">
                        {categories.length}
                    </span>
                </div>

                <Card className="rounded-none border-border bg-card overflow-hidden">
                    <CardContent className="p-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                등록된 카테고리가 없습니다.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="flex items-center gap-6 p-6 bg-card rounded-none border border-transparent hover:border-primary/20 hover:bg-secondary/30 transition-all duration-500 group"
                                    >
                                        <div className="text-muted-foreground/20">
                                            <GripVertical size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-lg font-black tracking-tight uppercase group-hover:text-primary transition-colors">
                                                {category.name}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                    객체 {category._count || 0}
                                                    개
                                                </span>
                                                <span className="w-1 h-1 rounded-none bg-border" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                    표시 순서{" "}
                                                    {category.display_order}
                                                </span>
                                            </div>
                                        </div>
                                        {/* All 탭 포함 토글 */}
                                        <button
                                            onClick={async () => {
                                                if (!supabase) return;
                                                const newValue = !category.show_in_all;
                                                const { error } = await supabase
                                                    .from("categories")
                                                    .update({ show_in_all: newValue })
                                                    .eq("id", category.id);
                                                if (error) {
                                                    toast.error("업데이트 실패: " + error.message);
                                                    return;
                                                }
                                                setCategories(categories.map(c =>
                                                    c.id === category.id ? { ...c, show_in_all: newValue } : c
                                                ));
                                                toast.success(newValue ? "All 탭에 포함됩니다." : "All 탭에서 제외됩니다.");
                                            }}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-none border transition-all duration-300 text-[10px] font-black uppercase tracking-widest ${
                                                category.show_in_all
                                                    ? "bg-primary/10 border-primary/30 text-primary"
                                                    : "bg-secondary/50 border-border text-muted-foreground"
                                            }`}
                                        >
                                            {category.show_in_all ? <Eye size={14} /> : <EyeOff size={14} />}
                                            All
                                        </button>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    handleEditOpen(category)
                                                }
                                                className="h-10 rounded-none bg-secondary/50 hover:bg-primary hover:text-primary-foreground border border-transparent"
                                            >
                                                <Pencil
                                                    size={14}
                                                    className="mr-2"
                                                />
                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                    수정
                                                </span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setDeletingCategory(category)
                                                }
                                                className="h-10 w-10 p-0 rounded-none bg-secondary/50 text-destructive hover:bg-destructive hover:text-destructive-foreground border border-transparent"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 수정 다이얼로그 */}
                <Dialog
                    open={!!editingCategory}
                    onOpenChange={() => setEditingCategory(null)}
                >
                    <DialogContent className="sm:max-w-[400px] rounded-none">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold">
                                카테고리 수정
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
                                    카테고리 이름
                                </label>
                                <Input
                                    value={editName}
                                    onChange={(e) =>
                                        setEditName(e.target.value)
                                    }
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
                                    정렬 순서
                                </label>
                                <Input
                                    type="number"
                                    value={editOrder}
                                    onChange={(e) =>
                                        setEditOrder(
                                            parseInt(e.target.value) || 0,
                                        )
                                    }
                                    className="h-10"
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    숫자가 낮을수록 먼저 표시됩니다.
                                </p>
                            </div>
                        </div>
                        <DialogFooter className="flex flex-row gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => setEditingCategory(null)}
                                disabled={isSaving}
                                className="flex-1"
                            >
                                취소
                            </Button>
                            <Button
                                onClick={handleEditSave}
                                disabled={!editName.trim() || isSaving}
                                className="flex-1"
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        저장
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* 삭제 확인 다이얼로그 */}
                <Dialog
                    open={!!deletingCategory}
                    onOpenChange={() => setDeletingCategory(null)}
                >
                    <DialogContent className="sm:max-w-[400px] rounded-none">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold">
                                카테고리 삭제
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p className="text-sm text-muted-foreground">
                                <strong className="text-foreground">
                                    {deletingCategory?.name}
                                </strong>{" "}
                                카테고리를 삭제하시겠습니까?
                            </p>
                            {deletingCategory?._count &&
                                deletingCategory._count > 0 && (
                                    <p className="text-sm text-destructive mt-2">
                                        ⚠️ 이 카테고리에{" "}
                                        {deletingCategory._count}개의 이미지가
                                        연결되어 있습니다.
                                    </p>
                                )}
                        </div>
                        <DialogFooter className="flex flex-row gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => setDeletingCategory(null)}
                                disabled={isDeleting}
                                className="flex-1"
                            >
                                취소
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1"
                            >
                                {isDeleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        삭제
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

