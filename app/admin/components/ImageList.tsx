import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ExternalLink, Image as ImageIcon, Edit2, ChevronUp, ChevronDown, Play } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";

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

interface ImageListProps {
    images: GalleryImage[];
    onDelete?: (id: string | number) => void;
    onEdit?: (image: GalleryImage) => void;
    onUpdateOrder?: (id: string | number, newOrder: number) => void;
    selectedIds: (string | number)[];
    onSelectionChange: (ids: (string | number)[]) => void;
}

export function ImageList({
    images,
    onDelete,
    onEdit,
    onUpdateOrder,
    selectedIds,
    onSelectionChange,
}: ImageListProps) {
    const isAllSelected =
        images.length > 0 && selectedIds.length === images.length;
    const isPartialSelected =
        selectedIds.length > 0 && selectedIds.length < images.length;

    const handleSelectAll = () => {
        if (isAllSelected) {
            onSelectionChange([]);
        } else {
            onSelectionChange(images.map((img) => img.id));
        }
    };

    const handleSelectOne = (id: string | number) => {
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter((itemId) => itemId !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between px-8 py-6 bg-card border border-border rounded-none select-none mb-8">
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
                            {isAllSelected ? "선택 해제" : `전체 선택 (${images.length})`}
                        </span>
                    </label>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tight bg-secondary/50 border border-border px-4 py-1.5 rounded-none">
                    <span>순서 변경: 입력 또는 화살표 사용</span>
                </div>
            </div>

            <div className="flex flex-col gap-4 p-1">
                {images.map((img, index) => {
                    const isSelected = selectedIds.includes(img.id);
                    const isFirst = index === 0;
                    const isLast = index === images.length - 1;

                    return (
                        <ImageCard 
                            key={img.id}
                            img={img}
                            isSelected={isSelected}
                            onSelectOne={handleSelectOne}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onUpdateOrder={onUpdateOrder}
                            isFirst={isFirst}
                            isLast={isLast}
                        />
                    );
                })}
            </div>

            {images.length === 0 && (
                <div className="py-32 flex flex-col items-center justify-center text-muted-foreground bg-secondary/20 border border-dashed border-border">
                    <ImageIcon size={48} className="mb-4 opacity-10" />
                    <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-30">
                        아카이브가 비어 있습니다
                    </p>
                </div>
            )}
        </div>
    );
}

interface ImageCardProps {
    img: GalleryImage;
    isSelected: boolean;
    onSelectOne: (id: string | number) => void;
    onEdit?: (image: GalleryImage) => void;
    onDelete?: (id: string | number) => void;
    onUpdateOrder?: (id: string | number, newOrder: number) => void;
    isFirst: boolean;
    isLast: boolean;
}

function ImageCard({ img, isSelected, onSelectOne, onEdit, onDelete, onUpdateOrder, isFirst, isLast }: ImageCardProps) {
    const [orderInput, setOrderInput] = useState(String(img.display_order));

    useEffect(() => {
        setOrderInput(String(img.display_order));
    }, [img.display_order]);

    const handleOrderBlur = () => {
        const newOrder = parseInt(orderInput, 10);
        if (!isNaN(newOrder) && newOrder !== img.display_order && onUpdateOrder) {
            onUpdateOrder(img.id, newOrder);
        } else {
            setOrderInput(String(img.display_order));
        }
    };

    const handleOrderKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleOrderBlur();
        }
    };

    return (
        <div
            className={`flex flex-col md:flex-row items-center gap-6 p-4 bg-card border rounded-none group transition-all duration-300 ${
                isSelected ? "border-primary bg-muted/30" : "border-border hover:border-primary/20 hover:bg-secondary/30"
            }`}
        >
            {/* Left: Hybrid Ordering Controls & Checkbox */}
            <div className="flex items-center gap-4 shrink-0">
                <div className="flex flex-col items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-none text-muted-foreground hover:text-primary disabled:opacity-20"
                        disabled={isFirst}
                        onClick={() => onUpdateOrder?.(img.id, img.display_order - 1)}
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
                        onClick={() => onUpdateOrder?.(img.id, img.display_order + 1)}
                    >
                        <ChevronDown size={14} />
                    </Button>
                </div>
                
                <div className="relative flex items-center justify-center pl-2">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectOne(img.id)}
                        className="peer appearance-none w-5 h-5 border border-input bg-background checked:bg-primary checked:border-primary transition-all duration-300 cursor-pointer"
                    />
                    <div className="absolute left-2 opacity-0 peer-checked:opacity-100 text-primary-foreground pointer-events-none transition-opacity duration-300">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                </div>
            </div>

            {/* Middle Left: Thumbnail */}
            <div className="relative w-32 h-20 md:w-40 md:h-24 bg-muted overflow-hidden shrink-0 border border-border">
                <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Video Indicator */}
                {(img.type === 'video' || img.video_url) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                        <Play fill="currentColor" size={16} className="text-white" />
                    </div>
                )}
            </div>

            {/* Middle Right: Information */}
            <div className="flex-1 min-w-0 flex flex-col gap-3">
                <div className="flex items-center gap-4">
                    <p className="text-2xl font-black tracking-tight uppercase truncate group-hover:text-primary transition-colors leading-[1.1]">
                        {img.alt || "No Title"}
                    </p>
                    {img.category_name && (
                        <span className="px-3 py-1 bg-secondary text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground border border-border leading-none">
                            {img.category_name}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <span className="w-1.5 h-1.5 rounded-none bg-border" />
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground/20 truncate">
                        ID: {img.id}
                    </span>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 rounded-none bg-muted/50 hover:bg-primary hover:text-primary-foreground border border-transparent"
                    onClick={() => onEdit?.(img)}
                >
                    <Edit2 size={14} className="mr-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">수정</span>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-none bg-muted/50 text-destructive hover:bg-destructive hover:text-destructive-foreground border border-transparent"
                    onClick={() => onDelete?.(img.id)}
                >
                    <Trash2 size={16} />
                </Button>
            </div>
        </div>
    );
}
