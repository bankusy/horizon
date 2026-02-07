"use client";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface GalleryImage {
    id: string | number;
    src: string;
    alt: string;
    category: string;
}

interface ImageListProps {
    images: GalleryImage[];
    onDelete?: (id: string | number) => void;
    selectedIds: (string | number)[];
    onSelectionChange: (ids: (string | number)[]) => void;
}

export function ImageList({
    images,
    onDelete,
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
        <div className="w-full">
            <Table>
                <TableHeader className="bg-zinc-50/50 hover:bg-transparent">
                    <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="w-[50px] pl-6">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    ref={(el) => {
                                        if (el)
                                            el.indeterminate =
                                                isPartialSelected;
                                    }}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                                />
                            </div>
                        </TableHead>
                        <TableHead className="w-[100px] h-12 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            미리보기
                        </TableHead>
                        <TableHead className="h-12 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            자산 정보
                        </TableHead>
                        <TableHead className="h-12 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            카테고리
                        </TableHead>
                        <TableHead className="h-12 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider pr-6">
                            관리
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {images.map((img) => {
                        const isSelected = selectedIds.includes(img.id);
                        return (
                            <TableRow
                                key={img.id}
                                className={`border-border group transition-all hover:bg-zinc-50/50 ${isSelected ? "bg-zinc-50/80" : ""}`}
                            >
                                <TableCell className="pl-6">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() =>
                                                handleSelectOne(img.id)
                                            }
                                            className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="relative w-16 h-16 overflow-hidden rounded-lg bg-zinc-100 border border-border">
                                        <Image
                                            src={img.src}
                                            alt={img.alt}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-semibold truncate max-w-[300px]">
                                            {img.alt}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                                            REF-ID: {img.id}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="secondary"
                                        className="rounded-md font-semibold text-[10px] px-2.5 py-0.5 border-border uppercase"
                                    >
                                        {img.category}
                                    </Badge>
                                </TableCell>
                                <TableCell className="pr-6 text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-md hover:bg-white border border-transparent hover:border-border"
                                            asChild
                                            title="원본 보기"
                                        >
                                            <a
                                                href={img.src}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <ExternalLink
                                                    size={14}
                                                    className="text-zinc-500"
                                                />
                                            </a>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-md text-destructive hover:text-white hover:bg-destructive border border-transparent hover:border-destructive"
                                            onClick={() => onDelete?.(img.id)}
                                            title="항목 삭제"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
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
