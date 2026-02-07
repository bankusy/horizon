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
}

export default function GalleryManagementPage() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [banners, setBanners] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("list");
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
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
                    .order("created_at", { ascending: false });

                if (imageError) throw imageError;
                
                const formattedImages = imageData?.map((item: any) => ({
                    id: item.id,
                    src: item.src,
                    alt: item.title,
                    category: item.category
                })) || [];
                
                setImages(formattedImages);

                // 2. Fetch Banners
                const { data: bannerData, error: bannerError } = await supabase
                    .from("banners")
                    .select("*")
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

    const handleAddImage = (newData: { id: string; title: string; src: string; category: string }) => {
        const newImage = {
            id: newData.id,
            alt: newData.title,
            src: newData.src,
            category: newData.category
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
                // Extract file path from public URL
                // Format: .../storage/v1/object/public/images/filename.webp
                const urlParts = imgData.src.split("/storage/v1/object/public/images/");
                if (urlParts.length > 1) {
                    const filePath = urlParts[1];
                    await supabase.storage.from("images").remove([filePath]);
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
                const filePaths = imagesToDelete
                    .map((img: { src: string }) => {
                        const urlParts = img.src.split("/storage/v1/object/public/images/");
                        return urlParts.length > 1 ? urlParts[1] : null;
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
    };

    const handleUpdateImage = async (id: string | number, updates: { title: string; category: string }) => {
        if (!supabase) return;

        try {
            const { error } = await supabase
                .from("gallery")
                .update({
                    title: updates.title,
                    category: updates.category
                })
                .eq("id", id);

            if (error) throw error;

            setImages(prev => prev.map(img => 
                img.id === id ? { ...img, alt: updates.title, category: updates.category } : img
            ));
            toast.success("정보가 성공적으로 수정되었습니다.");
        } catch (error: any) {
            console.error("Update error:", error);
            toast.error("수정에 실패했습니다.");
            throw error;
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
                        <div className="mb-4 p-4 bg-zinc-50 border border-border rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-zinc-900">{selectedIds.length}개 항목 선택됨</span>
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
                    <div className="rounded-xl border border-border bg-white  overflow-hidden">
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
                    <Card className="rounded-xl border-border  overflow-hidden">
                        <div className="p-6 border-b bg-zinc-50/50">
                            <h3 className="text-lg font-bold">새 배너 등록</h3>
                            <p className="text-sm text-muted-foreground">홈페이지 최상단 슬라이드에 표시될 큰 배너 이미지를 등록합니다.</p>
                        </div>
                        <BannerForm onAdd={handleAddBanner} />
                    </Card>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <h3 className="text-xl font-black uppercase tracking-tight">현재 배너 목록</h3>
                            <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-500">{banners.length}</span>
                        </div>
                        <BannerList banners={banners} onDelete={handleDeleteBanner} />
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
