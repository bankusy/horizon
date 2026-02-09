"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, Image as ImageIcon, Edit2, GripVertical } from "lucide-react";
import Image from "next/image";
import { Reorder, useDragControls } from "framer-motion";

interface GalleryImage {
    id: string | number;
    src: string;
    alt: string;
    category: string;
    display_order: number;
}

interface ImageListProps {
    images: GalleryImage[];
    onDelete?: (id: string | number) => void;
    onEdit?: (image: GalleryImage) => void;
    onReorder?: (newImages: GalleryImage[]) => void;
    onReorderComplete?: () => void;
    selectedIds: (string | number)[];
    onSelectionChange: (ids: (string | number)[]) => void;
}

export function ImageList({
    images,
    onDelete,
    onEdit,
    onReorder,
    onReorderComplete,
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
        <div className="w-full space-y-4">
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 bg-zinc-50 border border-border rounded-xl">
                <div className="flex items-center gap-4">
                    <div className="flex items-center h-5">
                        <input
                            type="checkbox"
                            checked={isAllSelected}
                            ref={(el) => {
                                if (el) el.indeterminate = isPartialSelected;
                            }}
                            onChange={handleSelectAll}
                            className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                        />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        전체 선택 ({images.length})
                    </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tight bg-white px-3 py-1 rounded-full border border-border shadow-sm">
                    <GripVertical size={12} />
                    핸들을 드래그하여 순서 변경
                </div>
            </div>

            <Reorder.Group 
                as="div" 
                axis="y" 
                values={images} 
                onReorder={onReorder || (() => {})}
                onDragEnd={onReorderComplete}
                className="flex flex-col gap-3 p-4 bg-zinc-50/30 rounded-xl"
            >
                {images.map((img) => {
                    const isSelected = selectedIds.includes(img.id);
                    return (
                        <ReorderRow 
                            key={img.id}
                            img={img}
                            isSelected={isSelected}
                            onSelectOne={handleSelectOne}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    );
                })}
            </Reorder.Group>

            {images.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-muted-foreground bg-zinc-50/20">
                    <ImageIcon size={40} className="mb-4 opacity-20" />
                    <p className="text-xs font-semibold uppercase tracking-widest">
                        아카이브가 비어 있습니다
                    </p>
                </div>
            )}
        </div>
    );
}
interface ReorderRowProps {
    img: GalleryImage;
    isSelected: boolean;
    onSelectOne: (id: string | number) => void;
    onEdit?: (image: GalleryImage) => void;
    onDelete?: (id: string | number) => void;
}

function ReorderRow({ img, isSelected, onSelectOne, onEdit, onDelete }: ReorderRowProps) {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={img}
            id={String(img.id)}
            dragListener={false}
            dragControls={controls}
            as="div"
            layout
            initial={false}
            animate={{ 
                scale: 1, 
                boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                zIndex: 1,
                backgroundColor: isSelected ? "rgb(244 244 245 / 0.5)" : "white"
            }}
            whileDrag={{ 
                scale: 1.02,
                boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                zIndex: 50,
                backgroundColor: "white",
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`flex items-center gap-4 p-3 rounded-xl border border-border shadow-sm group transition-colors hover:border-zinc-300 ${isSelected ? "border-zinc-900" : ""}`}
        >
            <div 
                className="cursor-grab active:cursor-grabbing p-2 hover:bg-zinc-100 rounded-lg transition-colors shrink-0"
                onPointerDown={(e) => controls.start(e)}
            >
                <GripVertical size={18} className="text-zinc-400" />
            </div>

            <div className="flex items-center shrink-0">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelectOne(img.id)}
                    className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                />
            </div>

            <div className="relative w-14 h-14 overflow-hidden rounded-lg bg-zinc-100 border border-border shrink-0">
                <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover"
                />
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="text-sm font-bold text-zinc-900 truncate">
                    {img.alt}
                </span>
                <div className="flex items-center gap-2">
                    <Badge
                        variant="secondary"
                        className="rounded-md font-bold text-[9px] px-1.5 py-0 border-border uppercase bg-zinc-100/50"
                    >
                        {img.category}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter tabular-nums">
                        #{img.display_order} • ID: {img.id}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-white border border-transparent hover:border-border"
                    onClick={() => onEdit?.(img)}
                >
                    <Edit2 size={14} className="text-zinc-500" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-white border border-transparent hover:border-border"
                    asChild
                >
                    <a href={img.src} target="_blank" rel="noreferrer">
                        <ExternalLink size={14} className="text-zinc-500" />
                    </a>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-destructive hover:text-white hover:bg-destructive border border-transparent hover:border-destructive"
                    onClick={() => onDelete?.(img.id)}
                >
                    <Trash2 size={14} />
                </Button>
            </div>
        </Reorder.Item>
    );
}
