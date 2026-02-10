"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, GripVertical, Check } from "lucide-react";
import { motion, Reorder } from "framer-motion";

interface VRContent {
    id: string;
    title: string;
    description?: string;
    thumbnail_url: string;
    link_url: string;
    display_order: number;
}

interface VRListProps {
    items: VRContent[];
    onDelete: (id: string) => void;
    onUpdateOrder: (id: string, newOrder: number) => void;
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
}

export function VRList({ items, onDelete, onUpdateOrder, selectedIds, onSelectionChange }: VRListProps) {
    const handleReorder = (newItems: VRContent[]) => {
        // Find what changed and trigger update
        // (Simplified for now, similar to how ImageList/BannerList handles it)
    };

    const toggleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter(i => i !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };

    if (items.length === 0) {
        return (
            <div className="py-20 border-2 border-dashed border-border flex flex-col items-center justify-center opacity-30">
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">No VR Content Registered</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
                <motion.div
                    key={item.id}
                    layout
                    className={`group relative bg-card border transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${selectedIds.includes(item.id) ? 'border-primary ring-1 ring-primary' : 'border-border'}`}
                >
                    {/* Checkbox */}
                    <div className="absolute top-4 left-4 z-20">
                        <input 
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={() => toggleSelect(item.id)}
                            className="w-5 h-5 rounded-none border-white/20 accent-primary"
                        />
                    </div>

                    {/* Image Area */}
                    <div className="relative aspect-video overflow-hidden">
                        <Image 
                            src={item.thumbnail_url} 
                            alt={item.title} 
                            fill 
                            className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
                    </div>

                    {/* Info Area */}
                    <div className="p-6 space-y-4">
                        <div className="space-y-1">
                            <h4 className="text-lg font-black tracking-tight uppercase truncate">{item.title}</h4>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">
                                {item.description || "No description"}
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <a 
                                href={item.link_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/70 transition-colors"
                            >
                                <ExternalLink size={12} /> View VR
                            </a>
                            
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDelete(item.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                            >
                                <Trash2 size={14} />
                            </Button>
                        </div>
                    </div>

                    {/* Order Badge */}
                    <div className="absolute top-4 right-4 px-2 py-1 bg-black/60 backdrop-blur-md text-[9px] font-black text-white/50 rounded-none border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                        ORDER: {item.display_order}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
