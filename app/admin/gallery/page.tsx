"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageForm } from "../components/ImageForm";
import { ImageList } from "../components/ImageList";
import { BannerForm } from "../components/BannerForm";
import { BannerList } from "../components/BannerList";
import { EditImageDialog } from "../components/EditImageDialog";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface GalleryImage {
    id: string | number;
    src: string;
    alt: string;
    category: string;
    display_order: number;
}

export default function GalleryManagementPage() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [banners, setBanners] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("list");
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
    const [selectedBannerIds, setSelectedBannerIds] = useState<string[]>([]);
    const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);

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
                    category: item.category,
                    display_order: item.display_order
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

    const handleAddImage = (newData: { id: string; title: string; src: string; category: string; video_url?: string; aspect_ratio: number; display_order: number }) => {
        const newImage: GalleryImage = {
            id: newData.id,
            alt: newData.title,
            src: newData.src,
            category: newData.category,
            display_order: newData.display_order
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

    const handleBannerReorder = (newBanners: any[]) => {
        // 즉시 로컬 UI 순서만 변경
        const baseOrder = banners.length > 0 ? Math.min(...banners.map(b => b.display_order)) : 0;
        const reordered = newBanners.map((b, index) => ({
            ...b,
            display_order: baseOrder + index
        }));
        setBanners(reordered);
    };

    const handleProcessBannerReorder = async () => {
        if (!supabase || banners.length === 0) return;
        try {
            const updates = banners.map(b => 
                supabase
                    .from("banners")
                    .update({ display_order: b.display_order })
                    .eq("id", b.id)
            );
            await Promise.all(updates);
            toast.success("배너 순서가 안전하게 저장되었습니다.");
        } catch (error: any) {
            console.error("Banner reorder save failed:", error);
            toast.error("배너 순서 저장 중 오류가 발생했습니다.");
        }
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

    const handleUpdateImage = async (id: string | number, updates: { title: string; category: string; display_order: number }) => {
        if (!supabase) return;
        try {
            // 1. 순서 맞교환(Swap) 로직 확인
            const targetOrder = updates.display_order;
            const existingImageWithOrder = images.find(img => img.display_order === targetOrder && img.id !== id);
            const currentImage = images.find(img => img.id === id);

            if (existingImageWithOrder && currentImage) {
                // 이미 해당 순서를 가진 이미지가 있다면 서로 순서를 맞바꿉니다.
                const oldOrder = currentImage.display_order;

                // DB 업데이트 (두 항목 모두)
                const { error: swapError1 } = await supabase
                    .from("gallery")
                    .update({ display_order: targetOrder, title: updates.title, category: updates.category })
                    .eq("id", id);
                
                const { error: swapError2 } = await supabase
                    .from("gallery")
                    .update({ display_order: oldOrder })
                    .eq("id", existingImageWithOrder.id);

                if (swapError1 || swapError2) throw swapError1 || swapError2;

                // 로컬 상태 업데이트
                setImages(prev => prev.map(img => {
                    if (img.id === id) return { ...img, alt: updates.title, category: updates.category, display_order: targetOrder };
                    if (img.id === existingImageWithOrder.id) return { ...img, display_order: oldOrder };
                    return img;
                }).sort((a, b) => a.display_order - b.display_order));
                
                toast.success(`순서가 ${existingImageWithOrder.alt} 항목과 맞교환되었습니다.`);
            } else {
                // 일반적인 단독 수정
                const { error } = await supabase
                    .from("gallery")
                    .update({
                        title: updates.title,
                        category: updates.category,
                        display_order: updates.display_order
                    })
                    .eq("id", id);
                if (error) throw error;
                
                setImages(prev => prev.map(img => 
                    img.id === id ? { ...img, alt: updates.title, category: updates.category, display_order: updates.display_order } : img
                ).sort((a, b) => a.display_order - b.display_order));
                
                toast.success("정보가 성공적으로 수정되었습니다.");
            }
        } catch (error: any) {
            console.error("Update error:", error);
            toast.error("수정에 실패했습니다.");
            throw error;
        }
    };

    const handleReorder = (newImages: GalleryImage[]) => {
        // 즉시 로컬 UI 순서만 변경 (DB 업데이트는 하지 않음)
        // 새로운 인덱스 순서대로 display_order 값을 임시로 재할당하여 UI에 반영합니다.
        const baseOrder = images.length > 0 ? Math.min(...images.map(img => img.display_order)) : 0;
        
        const reorderedImages = newImages.map((img, index) => ({
            ...img,
            display_order: baseOrder + index
        }));

        setImages(reorderedImages);
    };

    const handleProcessReorder = async () => {
        // 드래그가 완전히 끝난 시점에만 호출되어 DB에 한 번만 저장합니다.
        if (!supabase || images.length === 0) return;

        try {
            // 현재 images 상태는 handleReorder에 의해 이미 최신 순서로 정렬되어 있습니다.
            const updates = images.map(img => 
                supabase
                    .from("gallery")
                    .update({ display_order: img.display_order })
                    .eq("id", img.id)
            );
            
            await Promise.all(updates);
            toast.success("전체 순서가 안전하게 저장되었습니다.");
        } catch (error: any) {
            console.error("Reorder save failed:", error);
            toast.error("이미지 순서 저장 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-1">갤러리 아카이브</h2>
                    <p className="text-sm text-muted-foreground">스튜디오의 고화질 시각화 자산을 관리하고 등록합니다.</p>
                </div>
                
                <Button 
                    onClick={() => setActiveTab("upload")}
                    className="rounded-lg px-6 h-10 font-semibold"
                >
                    <Plus size={16} className="mr-2" />
                    새 이미지 등록
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-transparent h-auto p-0 gap-8 mb-8 border-b border-border w-full justify-start rounded-none">
                    <TabsTrigger 
                        value="list" 
                        className="rounded-none border-b border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 py-3 text-sm font-semibold transition-all text-muted-foreground data-[state=active]:text-foreground relative"
                    >
                        전체 목록 ({images.length})
                    </TabsTrigger>
                    <TabsTrigger 
                        value="upload" 
                        className="rounded-none border-b border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 py-3 text-sm font-semibold transition-all text-muted-foreground data-[state=active]:text-foreground"
                    >
                        이미지 등록
                    </TabsTrigger>
                    <TabsTrigger 
                        value="banner" 
                        className="rounded-none border-b border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 py-3 text-sm font-semibold transition-all text-muted-foreground data-[state=active]:text-foreground"
                    >
                        배너 관리 ({banners.length})
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="list" className="mt-0 focus-visible:outline-none">
                    {selectedIds.length > 0 && (
                        <div className="mb-4 p-4 bg-muted border border-border rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-foreground">{selectedIds.length}개 항목 선택됨</span>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])} className="h-8 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">
                                    선택 해제
                                </Button>
                            </div>
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={handleBatchDelete}
                                className="h-8 rounded-lg font-bold text-[11px] uppercase tracking-wider"
                            >
                                <Trash2 size={14} className="mr-2" />
                                선택 항목 삭제
                            </Button>
                        </div>
                    )}
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                                <p className="text-sm text-muted-foreground">데이터를 불러오는 중...</p>
                            </div>
                        ) : (
                            <ImageList 
                                images={images} 
                                onDelete={handleDeleteImage}
                                onEdit={setEditingImage}
                                onReorder={handleReorder}
                                onReorderComplete={handleProcessReorder}
                                selectedIds={selectedIds}
                                onSelectionChange={setSelectedIds}
                            />
                        )}
                    </div>
                </TabsContent>
                
                <TabsContent value="upload" className="mt-0 focus-visible:outline-none w-full">
                    <Card className="rounded-xl border-border ">
                        <ImageForm onAdd={handleAddImage} />
                    </Card>
                </TabsContent>

                <TabsContent value="banner" className="mt-0 focus-visible:outline-none w-full space-y-6">
                    {selectedBannerIds.length > 0 && (
                        <div className="mb-4 p-4 bg-muted border border-border rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-foreground">{selectedBannerIds.length}개 배너 선택됨</span>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedBannerIds([])} className="h-8 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">
                                    선택 해제
                                </Button>
                            </div>
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={handleBannerBatchDelete}
                                className="h-8 rounded-lg font-bold text-[11px] uppercase tracking-wider"
                            >
                                <Trash2 size={14} className="mr-2" />
                                선택 항목 삭제
                            </Button>
                        </div>
                    )}
                    <Card className="rounded-xl border-border overflow-hidden">
                        <div className="p-6 border-b bg-muted/30">
                            <h3 className="text-lg font-bold">새 배너 등록</h3>
                            <p className="text-sm text-muted-foreground">홈페이지 최상단 슬라이드에 표시될 큰 배너 이미지를 등록합니다.</p>
                        </div>
                        <BannerForm onAdd={handleAddBanner} />
                    </Card>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <h3 className="text-xl font-black uppercase tracking-tight text-foreground">현재 배너 목록</h3>
                            <span className="px-2 py-0.5 rounded-full bg-secondary text-[10px] font-bold text-muted-foreground">{banners.length}</span>
                        </div>
                        <BannerList 
                            banners={banners} 
                            onDelete={handleDeleteBanner} 
                            onReorder={handleBannerReorder}
                            onReorderComplete={handleProcessBannerReorder}
                            selectedIds={selectedBannerIds}
                            onSelectionChange={setSelectedBannerIds}
                        />
                    </div>
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
