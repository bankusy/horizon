"use client";

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { GalleryViewProps } from "@/types/gallery";
import { supabase } from "@/lib/supabase";
import { useGalleryData } from "@/hooks/useGalleryData";
import { useGallerySettings } from "@/hooks/useGallerySettings";
import { useLightbox } from "@/hooks/useLightbox";
import { GalleryHeader } from "@/components/gallery/GalleryHeader";
import { MasonryGrid } from "@/components/gallery/MasonryGrid";
import { LightboxOverlay } from "@/components/gallery/LightboxOverlay";

function GalleryContent({ initialImages, nextCursor, itemsPerPage = 50 }: GalleryViewProps) {
    // Load shuffle setting independently (before useGalleryData)
    const [isShuffled, setIsShuffled] = useState(false);
    useEffect(() => {
        async function loadShuffleSetting() {
            if (!supabase) return;
            const { data } = await supabase
                .from("site_settings")
                .select("value")
                .eq("key", "gallery_shuffle")
                .single();
            if (data?.value !== undefined) {
                setIsShuffled(Boolean(data.value));
            }
        }
        loadShuffleSetting();
    }, []);

    const {
        selectedCategoryId,
        setSelectedCategoryId,
        categories,
        categoriesMap,
        displayImages,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        totalCount,
    } = useGalleryData(initialImages, nextCursor, itemsPerPage, isShuffled);

    const {
        columnCount,
        imageRadius,
        imageBorderWidth,
        imageBorderColor,
        groupedColumns
    } = useGallerySettings(displayImages);

    const {
        lightboxIndex,
        setLightboxIndex,
        isAutoPlaying,
        setIsAutoPlaying,
        zoomLevel,
        setZoomLevel,
        isFullscreen,
        handleZoomIn,
        handleZoomOut,
        handleResetZoom,
        toggleFullscreen,
        nextLightbox,
        prevLightbox,
    } = useLightbox(displayImages, totalCount, fetchNextPage, hasNextPage, isFetchingNextPage);

    // Intersection Observer for Infinite Scroll
    const observer = useRef<IntersectionObserver | null>(null);
    const lastImageRef = useCallback(
        (node: HTMLDivElement) => {
            if (isLoading || isFetchingNextPage) return;
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && hasNextPage) {
                        fetchNextPage();
                    }
                },
                { threshold: 0.1, rootMargin: "100px" },
            );

            if (node) observer.current.observe(node);
        },
        [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage],
    );

    return (
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 py-24 flex flex-col gap-24">
            <GalleryHeader
                selectedCategoryId={selectedCategoryId}
                setSelectedCategoryId={setSelectedCategoryId}
                categories={categories}
                categoriesMap={categoriesMap}
            />

            <MasonryGrid
                groupedColumns={groupedColumns}
                columnCount={columnCount}
                imageRadius={imageRadius}
                imageBorderWidth={imageBorderWidth}
                imageBorderColor={imageBorderColor}
                setLightboxIndex={setLightboxIndex}
                setIsAutoPlaying={setIsAutoPlaying}
                lastImageRef={lastImageRef}
                displayImages={displayImages}
                isLoading={isLoading}
                isFetchingNextPage={isFetchingNextPage}
                hasNextPage={hasNextPage}
            />

            <LightboxOverlay
                lightboxIndex={lightboxIndex}
                displayImages={displayImages}
                totalCount={totalCount || displayImages.length}
                setLightboxIndex={setLightboxIndex}
                isAutoPlaying={isAutoPlaying}
                setIsAutoPlaying={setIsAutoPlaying}
                zoomLevel={zoomLevel}
                setZoomLevel={setZoomLevel}
                handleZoomIn={handleZoomIn}
                handleZoomOut={handleZoomOut}
                handleResetZoom={handleResetZoom}
                toggleFullscreen={toggleFullscreen}
                nextLightbox={nextLightbox}
                prevLightbox={prevLightbox}
            />
        </div>
    );
}

export function GalleryView(props: GalleryViewProps) {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-foreground/20" /></div>}>
            <GalleryContent {...props} />
        </Suspense>
    );
}

