"use client";

import React, { useState, useEffect } from "react";
import { VRForm } from "../components/VRForm";
import { VRList } from "../components/VRList";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Box } from "lucide-react";

export default function AdminVRPage() {
    const [vrItems, setVrItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => {
        const fetchVRData = async () => {
            if (!supabase) return;
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from("vr_contents")
                    .select("*")
                    .order("display_order", { ascending: true })
                    .order("created_at", { ascending: false });

                if (error) throw error;
                setVrItems(data || []);
            } catch (error: any) {
                console.error("Fetch error:", error);
                toast.error("VR 데이터를 불러오는데 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchVRData();
    }, []);

    const handleAddVR = (newVR: any) => {
        setVrItems(prev => [newVR, ...prev]);
    };

    const handleDeleteVR = async (id: string) => {
        if (!supabase) return;
        if (!confirm("정말로 삭제하시겠습니까?")) return;

        try {
            // 1. Get info for storage removal
            const itemToDelete = vrItems.find(item => item.id === id);
            
            // 2. Delete from DB
            const { error } = await supabase
                .from("vr_contents")
                .delete()
                .eq("id", id);

            if (error) throw error;

            // 3. Remove storage image (simplified, using same logic as gallery)
            if (itemToDelete?.thumbnail_url) {
                const bucketPrefix = "/storage/v1/object/public/images/";
                if (itemToDelete.thumbnail_url.includes(bucketPrefix)) {
                    const filePath = itemToDelete.thumbnail_url.split(bucketPrefix)[1];
                    if (filePath) {
                        await supabase.storage.from("images").remove([filePath]);
                    }
                }
            }

            setVrItems(prev => prev.filter(item => item.id !== id));
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
            toast.success("삭제되었습니다.");
        } catch (error: any) {
            console.error("Delete error:", error);
            toast.error("삭제에 실패했습니다.");
        }
    };

    const handleBatchDelete = async () => {
        if (!supabase || selectedIds.length === 0) return;
        if (!confirm(`선택한 ${selectedIds.length}개의 항목을 일괄 삭제하시겠습니까?`)) return;

        try {
            // 1. Get info for storage removal
            const itemsToDelete = vrItems.filter(item => selectedIds.includes(item.id));
            
            // 2. Delete from DB
            const { error } = await supabase
                .from("vr_contents")
                .delete()
                .in("id", selectedIds);

            if (error) throw error;

            // 3. Remove storage images
            const bucketPrefix = "/storage/v1/object/public/images/";
            const filePaths = itemsToDelete
                .map(item => {
                    if (item.thumbnail_url && item.thumbnail_url.includes(bucketPrefix)) {
                        return item.thumbnail_url.split(bucketPrefix)[1];
                    }
                    return null;
                })
                .filter(Boolean) as string[];

            if (filePaths.length > 0) {
                await supabase.storage.from("images").remove(filePaths);
            }

            setVrItems(prev => prev.filter(item => !selectedIds.includes(item.id)));
            setSelectedIds([]);
            toast.success("일괄 삭제되었습니다.");
        } catch (error: any) {
            console.error("Batch delete error:", error);
            toast.error("일괄 삭제에 실패했습니다.");
        }
    };

    const handleUpdateOrder = (id: string, newOrder: number) => {
        // Implementation for ordering if needed
    };

    return (
        <div className="min-h-screen space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-8 border-b border-border">
                <div className="space-y-3">
                    <h2 className="text-5xl font-black tracking-tighter uppercase leading-none">
                        VR 관리
                    </h2>
                    <p className="text-[10px] font-bold tracking-[0.3em] text-muted-foreground uppercase">
                        Virtual Reality Experience Archive
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-secondary border border-border">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            TOTAL: {vrItems.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Registration Form */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 px-4">
                    <Box size={20} className="text-primary" />
                    <h3 className="text-sm font-black uppercase tracking-widest">New VR Content Register</h3>
                </div>
                <VRForm onAdd={handleAddVR} />
            </section>

            {/* VR List area */}
            <section className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-8">
                    <div className="px-4">
                        <h3 className="text-4xl font-black uppercase tracking-tighter text-foreground leading-none">
                            VR Archive
                        </h3>
                    </div>

                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
                             <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
                                {selectedIds.length} Selected
                            </span>
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={handleBatchDelete}
                                className="h-10 px-6 font-black text-[10px] uppercase tracking-widest rounded-none"
                            >
                                Delete Selected
                            </Button>
                        </div>
                    )}
                </div>

                <div className="min-h-[300px]">
                    {isLoading ? (
                        <div className="py-32 flex flex-col items-center justify-center">
                            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20 mb-6" />
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Syncing VR Data</p>
                        </div>
                    ) : (
                        <VRList 
                            items={vrItems} 
                            onDelete={handleDeleteVR} 
                            onUpdateOrder={handleUpdateOrder}
                            selectedIds={selectedIds}
                            onSelectionChange={setSelectedIds}
                        />
                    )}
                </div>
            </section>
        </div>
    );
}
