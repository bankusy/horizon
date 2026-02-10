import { useState, useEffect, useCallback } from "react";
import { GalleryImage } from "@/types/gallery";

export function useLightbox(
    displayImages: GalleryImage[],
    totalCount: number,
    fetchNextPage?: () => void,
    hasNextPage?: boolean,
    isFetchingNextPage?: boolean,
) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    // Track if we should advance to the next image after loading more data
    const [shouldAutoAdvance, setShouldAutoAdvance] = useState(false);
    
    // Zoom & View State
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleZoomIn = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setZoomLevel(prev => Math.min(prev + 0.5, 3));
    };

    const handleZoomOut = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setZoomLevel(prev => Math.max(prev - 0.5, 1));
    };

    const handleResetZoom = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setZoomLevel(1);
    };

    const toggleFullscreen = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false));
        }
    };

    // Auto-advance when new images are loaded
    useEffect(() => {
        if (
            shouldAutoAdvance &&
            !isFetchingNextPage &&
            lightboxIndex !== null &&
            lightboxIndex < displayImages.length - 1
        ) {
            setLightboxIndex((prev) => (prev !== null ? prev + 1 : null));
            setShouldAutoAdvance(false);
        }
    }, [displayImages.length, isFetchingNextPage, shouldAutoAdvance, lightboxIndex]);

    const nextLightbox = useCallback(() => {
        setLightboxIndex((prev) => {
            if (prev === null) return null;

            // If at the last loaded image
            if (prev === displayImages.length - 1) {
                // If there are more images to load on the server
                if (hasNextPage && fetchNextPage) {
                    fetchNextPage();
                    setShouldAutoAdvance(true);
                    return prev; // Stay on current image while loading
                }
                // If truly the last image of all data
                if (displayImages.length === totalCount) {
                     return 0; // Wrap around to start
                }
                // Otherwise (loaded all but length mismatch?), prevent loop or stay
                return prev;
            }

            return prev + 1;
        });
    }, [displayImages.length, hasNextPage, fetchNextPage, totalCount]);

    const prevLightbox = useCallback(() => {
        setLightboxIndex((prev) => {
            if (prev === null) return null;
            // IF at 0
            if (prev === 0) {
                // Only wrap around if we have ALL images loaded
                if (displayImages.length === totalCount) {
                    return displayImages.length - 1;
                }
                // Otherwise, do NOT wrap around to the middle (e.g. 50th)
                return 0; 
            }
            return prev - 1;
        });
    }, [displayImages.length, totalCount]);

    // Keyboard controls for Lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex === null) return;
            if (e.key === "Escape") {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                    setIsFullscreen(false);
                } else {
                    setLightboxIndex(null);
                    setZoomLevel(1);
                }
            }
            if (e.key === "ArrowRight") nextLightbox();
            if (e.key === "ArrowLeft") prevLightbox();
            if (e.key === " ") {
                e.preventDefault();
                setIsAutoPlaying((prev) => !prev);
            }
            if (e.key === "+" || e.key === "=") handleZoomIn();
            if (e.key === "-" || e.key === "_") handleZoomOut();
            if (e.key === "0") handleResetZoom();
            if (e.key === "f") toggleFullscreen();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [lightboxIndex, nextLightbox, prevLightbox]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isAutoPlaying && lightboxIndex !== null) {
            timer = setInterval(() => {
                setLightboxIndex((prev) =>
                    prev !== null ? (prev + 1) % displayImages.length : null,
                );
            }, 3000);
        }
        return () => clearInterval(timer);
    }, [isAutoPlaying, lightboxIndex, displayImages.length]);

    useEffect(() => {
        if (lightboxIndex !== null) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [lightboxIndex]);

    return {
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
        prevLightbox
    };
}
