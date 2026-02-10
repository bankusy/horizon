"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnifiedMediaForm } from "../components/UnifiedMediaForm";
import { ImageList } from "../components/ImageList";
import { BannerForm } from "../components/BannerForm";
import { BannerList } from "../components/BannerList";
import { EditImageDialog } from "../components/EditImageDialog";
import { Button } from "@/components/ui/button";
import { LayoutGroup } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Category {
    id: string;
    name: string;
}

interface GalleryImage {
    id: string | number;
    src: string;
    alt: string;
    category_id: string;
    category_name?: string;
    display_order: number;
    type?: string;
    video_url?: string;
}

export default function GalleryManagementPage() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [banners, setBanners] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("archive");
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
    const [selectedBannerIds, setSelectedBannerIds] = useState<string[]>([]);
    const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

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

    // 필터링된 이미지
    const filteredImages = useMemo(() => {
        if (selectedCategoryId === "all") return images;
        return images.filter(img => img.category_id === selectedCategoryId);
    }, [images, selectedCategoryId]);

    // Fetch images and banners from Supabase on mount
    React.useEffect(() => {
        const fetchData = async () => {
            if (!supabase) return;
            setIsLoading(true);
            try {
                // 1. Fetch Images
                const { data: imageData, error: imageError } = await supabase
                    .from("gallery")
                    .select("*")
                    .order("display_order", { ascending: true })
                    .order("created_at", { ascending: false });

                if (imageError) throw imageError;
                
                const formattedImages = imageData?.map((item: any) => ({
                    id: item.id,
                    src: item.src,
                    alt: item.title,
                    category_id: item.category_id,
                    display_order: item.display_order,
                    type: item.type,
                    video_url: item.video_url
                })) || [];
                
                setImages(formattedImages);

                // 2. Fetch Banners
                const { data: bannerData, error: bannerError } = await supabase
                    .from("banners")
                    .select("*")
                    .order("display_order", { ascending: true })
                    .order("created_at", { ascending: false });

                if (bannerError) throw bannerError;
                setBanners(bannerData || []);

            } catch (error: any) {
                console.error("Fetch error:", error);
                toast.error("데이터를 불러오는데 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAddImage = (newData: { id: string; title: string; src: string; category_id: string; category_name?: string; video_url?: string; type?: string; aspect_ratio?: number; display_order: number }) => {
        const newImage: GalleryImage = {
            id: newData.id,
            alt: newData.title,
            src: newData.src,
            category_id: newData.category_id,
            category_name: newData.category_name,
            display_order: newData.display_order,
            type: newData.type,
            video_url: newData.video_url
        };
        setImages(prev => [newImage, ...prev]);
        // Note: Removed setActiveTab("list") to allow bulk upload to finish in current tab
    };

    const handleDeleteImage = async (id: string | number) => {
        if (!supabase) return;
        
        try {
            // 1. Get image info to find storage path
            const { data: imgData } = await supabase
                .from("gallery")
                .select("src")
                .eq("id", id)
                .single();

            if (imgData?.src) {
                // public URL에서 스토리지 상대 경로 추출
                // 예: .../storage/v1/object/public/images/gallery/filename.webp -> gallery/filename.webp
                const bucketPrefix = "/storage/v1/object/public/images/";
                if (imgData.src.includes(bucketPrefix)) {
                    const filePath = imgData.src.split(bucketPrefix)[1];
                    if (filePath) {
                        await supabase.storage.from("images").remove([filePath]);
                    }
                }
            }

            // 2. Delete from Database
            const { error } = await supabase
                .from("gallery")
                .delete()
                .eq("id", id);

            if (error) throw error;
            
            setImages(prev => prev.filter(img => img.id !== id));
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
            toast.success("항목이 성공적으로 삭제되었습니다.");
        } catch (error: any) {
            console.error("Delete error:", error);
            toast.error("삭제에 실패했습니다.");
        }
    };

    const handleBatchDelete = async () => {
        if (!supabase || selectedIds.length === 0) return;
        
        if (!confirm(`선택한 ${selectedIds.length}개의 항목을 삭제하시겠습니까?`)) return;

        try {
            // 1. Get multiple image info for storage paths
            const { data: imagesToDelete } = await supabase
                .from("gallery")
                .select("src")
                .in("id", selectedIds);

            if (imagesToDelete && imagesToDelete.length > 0) {
                const bucketPrefix = "/storage/v1/object/public/images/";
                const filePaths = imagesToDelete
                    .map((img: { src: string }) => {
                        if (img.src && img.src.includes(bucketPrefix)) {
                            return img.src.split(bucketPrefix)[1];
                        }
                        return null;
                    })
                    .filter(Boolean) as string[];

                if (filePaths.length > 0) {
                    await supabase.storage.from("images").remove(filePaths);
                }
            }

            // 2. Delete from Database
            const { error } = await supabase
                .from("gallery")
                .delete()
                .in("id", selectedIds);

            if (error) throw error;
            
            setImages(prev => prev.filter(img => !selectedIds.includes(img.id)));
            setSelectedIds([]);
            toast.success(`${selectedIds.length}개의 항목이 삭제되었습니다.`);
        } catch (error: any) {
            console.error("Batch delete error:", error);
            toast.error("일괄 삭제에 실패했습니다.");
        }
    };

    const handleAddBanner = (newBanner: any) => {
        setBanners(prev => [newBanner, ...prev]);
    };

    const handleDeleteBanner = (id: string) => {
        setBanners(prev => prev.filter(b => b.id !== id));
        setSelectedBannerIds(prev => prev.filter(selectedId => selectedId !== id));
    };

    const handleBannerBatchDelete = async () => {
        if (!supabase || selectedBannerIds.length === 0) return;
        if (!confirm(`선택한 ${selectedBannerIds.length}개의 배너를 삭제하시겠습니까?`)) return;

        try {
            // 1. Get storage paths
            const { data: bannersToDelete } = await supabase
                .from("banners")
                .select("src")
                .in("id", selectedBannerIds);

            if (bannersToDelete && bannersToDelete.length > 0) {
                const bucketPrefix = "/storage/v1/object/public/images/";
                const filePaths = bannersToDelete
                    .map((b: { src: string }) => {
                        if (b.src && b.src.includes(bucketPrefix)) {
                            return b.src.split(bucketPrefix)[1];
                        }
                        return null;
                    })
                    .filter(Boolean) as string[];

                if (filePaths.length > 0) {
                    await supabase.storage.from("images").remove(filePaths);
                }
            }

            // 2. Delete from DB
            const { error } = await supabase
                .from("banners")
                .delete()
                .in("id", selectedBannerIds);

            if (error) throw error;

            setBanners(prev => prev.filter(b => !selectedBannerIds.includes(b.id)));
            setSelectedBannerIds([]);
            toast.success(`${selectedBannerIds.length}개의 배너가 삭제되었습니다.`);
        } catch (error: any) {
            console.error("Banner batch delete error:", error);
            toast.error("배너 일괄 삭제에 실패했습니다.");
        }
    };

    const handleUpdateImage = async (id: string | number, updates: { title: string; category_id: string; display_order: number }) => {
        if (!supabase) return;
        try {
             // 1. Check if order changed and if we need to swap or just update
            const targetOrder = updates.display_order;
            const currentImage = images.find(img => img.id === id);

            if (currentImage && currentImage.display_order !== targetOrder) {
                 // Try swap if conflict exists
                 const existingImageWithOrder = images.find(img => img.display_order === targetOrder && img.id !== id);
                 
                 if (existingImageWithOrder) {
                     // Swap logic
                     const oldOrder = currentImage.display_order;
                     
                     const { error: swapError1 } = await supabase
                        .from("gallery")
                        .update({ display_order: targetOrder, title: updates.title, category_id: updates.category_id })
                        .eq("id", id);
                    
                    const { error: swapError2 } = await supabase
                        .from("gallery")
                        .update({ display_order: oldOrder })
                        .eq("id", existingImageWithOrder.id);

                    if (swapError1 || swapError2) throw swapError1 || swapError2;

                    setImages(prev => prev.map(img => {
                        if (img.id === id) return { ...img, alt: updates.title, category_id: updates.category_id, display_order: targetOrder };
                        if (img.id === existingImageWithOrder.id) return { ...img, display_order: oldOrder };
                        return img;
                    }).sort((a, b) => a.display_order - b.display_order));
                    
                    toast.success("정보가 수정되고 순서가 교체되었습니다.");
                 } else {
                     // Just update
                     const { error } = await supabase
                        .from("gallery")
                        .update({
                            title: updates.title,
                            category_id: updates.category_id,
                            display_order: updates.display_order
                        })
                        .eq("id", id);
                    if (error) throw error;

                    setImages(prev => prev.map(img => 
                        img.id === id ? { ...img, alt: updates.title, category_id: updates.category_id, display_order: updates.display_order } : img
                    ).sort((a, b) => a.display_order - b.display_order));
                    toast.success("정보가 수정되었습니다.");
                 }
            } else {
                // No order change or simple update
                const { error } = await supabase
                    .from("gallery")
                    .update({
                        title: updates.title,
                        category_id: updates.category_id
                    })
                    .eq("id", id);
                if (error) throw error;
                
                setImages(prev => prev.map(img => 
                    img.id === id ? { ...img, alt: updates.title, category_id: updates.category_id } : img
                ).sort((a, b) => a.display_order - b.display_order));
                toast.success("정보가 수정되었습니다.");
            }
        } catch (error: any) {
            console.error("Update error:", error);
            toast.error("수정에 실패했습니다.");
        }
    };

    const handleGalleryOrderUpdate = async (id: string | number, newOrder: number) => {
        if (!supabase) return;
        
        // 1. Validation
        if (newOrder < 1 || newOrder > images.length) {
            toast.error("유효하지 않은 순서입니다.");
            return;
        }

        const currentImage = images.find(img => img.id === id);
        if (!currentImage || currentImage.display_order === newOrder) return;

        try {
            // 2. Find target image to swap with
            const targetImage = images.find(img => img.display_order === newOrder);
            
            if (targetImage) {
                // Swap logic
                const { error: error1 } = await supabase
                    .from("gallery")
                    .update({ display_order: newOrder })
                    .eq("id", id);
                
                const { error: error2 } = await supabase
                    .from("gallery")
                    .update({ display_order: currentImage.display_order })
                    .eq("id", targetImage.id);

                if (error1 || error2) throw error1 || error2;

                setImages(prev => prev.map(img => {
                    if (img.id === id) return { ...img, display_order: newOrder };
                    if (img.id === targetImage.id) return { ...img, display_order: currentImage.display_order };
                    return img;
                }).sort((a, b) => a.display_order - b.display_order));

                toast.success("순서가 변경되었습니다.");
            } else {
                // Just update if no conflict (rare case if list is consistent)
                const { error } = await supabase
                    .from("gallery")
                    .update({ display_order: newOrder })
                    .eq("id", id);
                
                if (error) throw error;

                setImages(prev => prev.map(img => 
                    img.id === id ? { ...img, display_order: newOrder } : img
                ).sort((a, b) => a.display_order - b.display_order));
                 toast.success("순서가 변경되었습니다.");
            }
        } catch (error) {
            console.error("Order update failed:", error);
            toast.error("순서 변경에 실패했습니다.");
        }
    };

    const handleBannerOrderUpdate = async (id: string, newOrder: number) => {
        if (!supabase) return;

        if (newOrder < 0) { // Banners might be 0-indexed or 1-indexed, let's assume 0 based on previous code or just check bounds
             // Previous code: baseOrder + index. Let's assume strict simple ordering 1..N for simplicity or just relative.
             // BannerList uses index 0..N. Let's check bounds carefully.
             // Wait, previous code `banner.display_order` was used.
             // Let's assume 1-based for consistency with UI "ORDER #1".
             toast.error("유효하지 않은 순서입니다.");
             return;
        }
        
        // Check bounds against sorted list
        // Banners might have gaps if deleted? No, we usually renormalize.
        // But for swap, we just need to find the target.
        
        const currentBanner = banners.find(b => b.id === id);
        if (!currentBanner || currentBanner.display_order === newOrder) return;

        try {
            const targetBanner = banners.find(b => b.display_order === newOrder);

            if (targetBanner) {
                 const { error: error1 } = await supabase
                    .from("banners")
                    .update({ display_order: newOrder })
                    .eq("id", id);
                
                const { error: error2 } = await supabase
                    .from("banners")
                    .update({ display_order: currentBanner.display_order })
                    .eq("id", targetBanner.id);

                if (error1 || error2) throw error1 || error2;

                setBanners(prev => prev.map(b => {
                    if (b.id === id) return { ...b, display_order: newOrder };
                    if (b.id === targetBanner.id) return { ...b, display_order: currentBanner.display_order };
                    return b;
                }).sort((a, b) => a.display_order - b.display_order));
                
                toast.success("배너 순서가 변경되었습니다.");
            } else {
                 const { error } = await supabase
                    .from("banners")
                    .update({ display_order: newOrder })
                    .eq("id", id);
                
                if (error) throw error;

                setBanners(prev => prev.map(b => 
                    b.id === id ? { ...b, display_order: newOrder } : b
                ).sort((a, b) => a.display_order - b.display_order));
                toast.success("배너 순서가 변경되었습니다.");
            }
        } catch (error) {
            console.error("Banner order update failed:", error);
            toast.error("순서 변경에 실패했습니다.");
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground space-y-12 pb-20">
            {/* Area 1: Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-8 border-b border-border">
                <div className="space-y-3">
                    <h2 className="text-5xl font-black tracking-tighter uppercase leading-none">
                        관리자 갤러리
                    </h2>
                    <p className="text-[10px] font-bold tracking-[0.3em] text-foreground/50 uppercase">
                        Studio Asset Management System
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-secondary border border-border">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            전체: {images.length}
                        </span>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-12">
                <div className="flex justify-center border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-xl z-50 py-4">
                    <TabsList className="bg-muted/50 p-1 border border-border h-14">
                        <TabsTrigger 
                            value="archive" 
                            className="px-12 font-black uppercase tracking-widest text-[11px] data-[state=active]:bg-background data-[state=active]:text-primary transition-all duration-500"
                        >
                            이미지 & 영상 아카이브
                        </TabsTrigger>
                        <TabsTrigger 
                            value="banners" 
                            className="px-12 font-black uppercase tracking-widest text-[11px] data-[state=active]:bg-background data-[state=active]:text-primary transition-all duration-500"
                        >
                            히어로 배너 관리
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="archive" className="m-0 space-y-24 outline-none animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Asset Registration Area */}
                    <div className="flex flex-col gap-12">
                        <UnifiedMediaForm onAdd={handleAddImage} />
                    </div>

                    {/* Gallery Archive List Area */}
                    <section className="space-y-12">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-t-2 border-border/50 pt-16">
                            <div className="flex items-center gap-6 px-4">
                                <h3 className="text-4xl font-black uppercase tracking-tighter text-foreground leading-none">
                                    아카이브 목록
                                </h3>
                                <span className="px-4 py-1.5 bg-secondary text-xs font-black text-muted-foreground border border-border">
                                    {filteredImages.length} Assets
                                </span>
                            </div>

                            {/* Toolbar */}
                            <div className="flex flex-wrap items-center gap-4 py-3 bg-muted/10 ml-auto">
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">필터</span>
                                    <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                                        <SelectTrigger className="w-[180px] h-10 bg-background border-border text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-all">
                                            <SelectValue placeholder="카테고리" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border text-popover-foreground">
                                            <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest">전체</SelectItem>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id} className="text-[10px] font-bold uppercase tracking-widest">
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedIds.length > 0 && (
                                    <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                        <span className="w-px h-6 bg-border mx-2" />
                                        <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
                                            {selectedIds.length}개 선택됨
                                        </span>
                                        <Button 
                                            variant="destructive" 
                                            size="sm" 
                                            onClick={handleBatchDelete}
                                            className="h-10 px-6 font-black text-[10px] uppercase tracking-widest"
                                        >
                                            선택 항목 삭제
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="min-h-[400px]">
                            {isLoading ? (
                                <div className="py-40 flex flex-col items-center justify-center">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-6 opacity-20" />
                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">아카이브 동기화 중</p>
                                </div>
                            ) : (
                                activeTab === "archive" && (
                                    <LayoutGroup id="gallery-archive">
                                        <ImageList 
                                            images={filteredImages} 
                                            onDelete={handleDeleteImage}
                                            onEdit={setEditingImage}
                                            onUpdateOrder={handleGalleryOrderUpdate}
                                            selectedIds={selectedIds}
                                            onSelectionChange={setSelectedIds}
                                        />
                                    </LayoutGroup>
                                )
                            )}
                        </div>
                    </section>
                </TabsContent>

                <TabsContent value="banners" className="m-0 space-y-24 outline-none animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Hero Banner Area */}
                    <section className="space-y-12">
                        <div className="flex items-center gap-6 px-4">
                            <h3 className="text-4xl font-black uppercase tracking-tighter text-foreground leading-none">
                                히어로 배너 관리
                            </h3>
                            <span className="px-4 py-1.5 bg-secondary text-xs font-black text-muted-foreground border border-border">
                                {banners.length} Banners
                            </span>
                        </div>

                        <div className="flex flex-col gap-12">
                            {/* 배너 등록 폼 */}
                            <Card className="border-border bg-card overflow-hidden w-full">
                                <CardHeader className="p-6 border-b border-border bg-secondary/10">
                                    <CardTitle className="text-sm font-black uppercase tracking-widest">
                                        새 배너 추가
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <BannerForm onAdd={handleAddBanner} />
                                </CardContent>
                            </Card>

                            {/* 배너 목록 */}
                            <div className="w-full space-y-6">
                                {selectedBannerIds.length > 0 && (
                                    <div className="p-4 bg-muted/30 border border-destructive/20 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
                                            {selectedBannerIds.length}개의 배너 선택됨
                                        </span>
                                        <Button 
                                            variant="destructive" 
                                            size="sm" 
                                            onClick={handleBannerBatchDelete}
                                            className="h-8 px-6 font-black text-[9px] uppercase tracking-widest"
                                        >
                                            선택 삭제
                                        </Button>
                                    </div>
                                )}
                                {activeTab === "banners" && (
                                    <LayoutGroup id="hero-banners">
                                        <BannerList 
                                            banners={banners} 
                                            onDelete={handleDeleteBanner} 
                                            onUpdateOrder={handleBannerOrderUpdate}
                                            selectedIds={selectedBannerIds}
                                            onSelectionChange={setSelectedBannerIds}
                                        />
                                    </LayoutGroup>
                                )}
                            </div>
                        </div>
                    </section>
                </TabsContent>
            </Tabs>

            <EditImageDialog 
                isOpen={!!editingImage}
                onClose={() => setEditingImage(null)}
                onSave={handleUpdateImage}
                image={editingImage}
            />
        </div>
    );
}

