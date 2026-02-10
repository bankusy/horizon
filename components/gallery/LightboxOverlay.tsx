import { useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    Filter,
    Play,
    Pause,
    Plus,
    Minus,
    Maximize,
    Expand,
    X,
} from "lucide-react";
import Image from "next/image";
import { GalleryImage } from "@/types/gallery";
import { getYoutubeId } from "@/hooks/useGalleryData";

interface LightboxOverlayProps {
    lightboxIndex: number | null;
    displayImages: GalleryImage[];
    totalCount: number;
    setLightboxIndex: (index: number | null) => void;
    isAutoPlaying: boolean;
    setIsAutoPlaying: (isPlaying: boolean) => void;
    zoomLevel: number;
    setZoomLevel: (level: number) => void;
    handleZoomIn: (e?: React.MouseEvent) => void;
    handleZoomOut: (e?: React.MouseEvent) => void;
    handleResetZoom: (e?: React.MouseEvent) => void;
    toggleFullscreen: (e?: React.MouseEvent) => void;
    nextLightbox: () => void;
    prevLightbox: () => void;
}

export function LightboxOverlay({
    lightboxIndex,
    displayImages,
    totalCount,
    setLightboxIndex,
    isAutoPlaying,
    setIsAutoPlaying,
    zoomLevel,
    setZoomLevel,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    toggleFullscreen,
    nextLightbox,
    prevLightbox,
}: LightboxOverlayProps) {
    return (
        <AnimatePresence>
            {lightboxIndex !== null && displayImages[lightboxIndex] && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed min-h-dvh inset-0 z-150 bg-zinc-950/98 backdrop-blur-3xl flex flex-col"
                >
                    <div className="absolute top-0 inset-x-0 h-20 md:h-24 px-6 md:px-8 flex items-center justify-end z-60 pointer-events-none">
                        {/* Top Right Controls Group */}
                        <div className="flex items-center gap-2 md:gap-4 pointer-events-auto">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsAutoPlaying(!isAutoPlaying);
                                }}
                                className={`p-2 md:p-3 rounded-full border transition-all duration-500 ${
                                    isAutoPlaying
                                        ? "bg-white text-black border-white shadow-xl"
                                        : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                                }`}
                                title={
                                    isAutoPlaying
                                        ? "Pause AutoPlay"
                                        : "Start AutoPlay"
                                }
                            >
                                {isAutoPlaying ? (
                                    <Pause size={20} fill="currentColor" />
                                ) : (
                                    <Play size={20} fill="currentColor" />
                                )}
                            </button>
                            <div className="h-6 w-px bg-white/20 mx-2" />
                            <button
                                onClick={handleZoomIn}
                                className="p-2 md:p-3 bg-white/5 rounded-full text-white hover:bg-white/10 active:scale-95 transition-all duration-300 border border-white/10"
                                title="Zoom In (+)"
                            >
                                <Plus size={20} />
                            </button>
                            <button
                                onClick={handleZoomOut}
                                className="p-2 md:p-3 bg-white/5 rounded-full text-white hover:bg-white/10 active:scale-95 transition-all duration-300 border border-white/10"
                                title="Zoom Out (-)"
                            >
                                <Minus size={20} />
                            </button>
                            <button
                                onClick={handleResetZoom}
                                className="p-2 md:p-3 bg-white/5 rounded-full text-white hover:bg-white/10 active:scale-95 transition-all duration-300 border border-white/10"
                                title="Fit Screen (0)"
                            >
                                <Maximize size={20} />
                            </button>
                            <button
                                onClick={toggleFullscreen}
                                className="p-2 md:p-3 bg-white/5 rounded-full text-white hover:bg-white/10 active:scale-95 transition-all duration-300 border border-white/10"
                                title="Fullscreen (f)"
                            >
                                <Expand size={20} />
                            </button>
                            <div className="h-6 w-px bg-white/20 mx-2" />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLightboxIndex(null);
                                    setZoomLevel(1);
                                }}
                                className="p-2 md:p-3 bg-white/5 rounded-full text-white hover:bg-white/10 hover:rotate-90 transition-all duration-500 border border-white/10"
                                title="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 relative flex items-center justify-center">
                        <button
                            onClick={prevLightbox}
                            className="absolute left-4 md:left-8 z-60 p-2 md:p-3 rounded-full bg-white/5 border border-white/5 text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-500"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={displayImages[lightboxIndex].id}
                                initial={{
                                    opacity: 0,
                                    scale: 0.95,
                                    filter: "blur(10px)",
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    filter: "blur(0px)",
                                }}
                                transition={{
                                    duration: 0.8,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                className="relative w-full h-full flex items-center justify-center font-inter"
                            >
                                <div className="relative w-full h-full flex items-center justify-center py-20 px-4 md:py-24 md:px-12 pointer-events-none">
                                    <div className="relative w-full h-full pointer-events-auto flex items-center justify-center">
                                        {displayImages[lightboxIndex].video_url ? (
                                            <div className="relative w-full h-full max-w-6xl aspect-video overflow-hidden shadow-2xl bg-black rounded-lg">
                                                {/* Mobile Player: Controls Enabled, No Overlay */}
                                                <div className="block md:hidden w-full h-full">
                                                    <iframe
                                                        width="100%"
                                                        height="100%"
                                                        src={`https://www.youtube.com/embed/${getYoutubeId(
                                                            displayImages[
                                                                lightboxIndex
                                                            ].video_url!
                                                        )}?autoplay=1&controls=1&modestbranding=1&rel=0&disablekb=1&iv_load_policy=3&showinfo=0&mute=0&vq=hd1080&playsinline=1`}
                                                        title="YouTube video player"
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                        allowFullScreen
                                                        className="w-full h-full scale-[1.0] origin-center object-contain"
                                                    />
                                                </div>

                                                {/* Desktop Player: Controls Disabled, Fixed Overlay */}
                                                <div className="hidden md:block w-full h-full relative">
                                                    <iframe
                                                        width="100%"
                                                        height="100%"
                                                        src={`https://www.youtube.com/embed/${getYoutubeId(
                                                            displayImages[
                                                                lightboxIndex
                                                            ].video_url!
                                                        )}?autoplay=1&controls=0&modestbranding=1&rel=0&disablekb=1&iv_load_policy=3&showinfo=0&mute=0&vq=hd1080&playsinline=1`}
                                                        title="YouTube video player"
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                        allowFullScreen
                                                        className="w-full h-full scale-[1.0] origin-center object-contain"
                                                    />
                                                    <div className="absolute inset-0 z-10 bg-transparent cursor-default" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative w-full h-full">
                                                <Image
                                                    fill
                                                    className="object-contain transition-transform duration-300 ease-out"
                                                    style={{
                                                        transform: `scale(${zoomLevel})`,
                                                    }}
                                                    src={
                                                        lightboxIndex !== null
                                                            ? displayImages[
                                                                  lightboxIndex
                                                              ].src
                                                            : ""
                                                    }
                                                    alt={
                                                        lightboxIndex !== null
                                                            ? displayImages[
                                                                  lightboxIndex
                                                              ].alt
                                                            : ""
                                                    }
                                                    priority
                                                    sizes="100vw"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <button
                            onClick={nextLightbox}
                            className="absolute right-4 md:right-8 z-60 p-2 md:p-3 rounded-full bg-white/5 border border-white/5 text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-500"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 h-20 md:h-24 px-6 md:px-8 flex items-center justify-between z-60 bg-linear-to-t from-black/50 to-transparent">
                        {/* Info Section (Moved to Bottom Bar) */}
                        <div className="flex flex-col justify-center text-white pointer-events-none">
                            <p className="text-[10px] font-black tracking-[1em] uppercase opacity-30 mb-1">
                                {displayImages[lightboxIndex].category_name}
                            </p>
                            <div className="flex items-baseline gap-4">
                                <h2 className="text-lg md:text-xl font-light tracking-widest uppercase opacity-90">
                                    {displayImages[lightboxIndex].alt}
                                </h2>
                                {displayImages[lightboxIndex].width &&
                                    displayImages[lightboxIndex].height && (
                                        <p className="text-[10px] font-bold tracking-[0.2em] opacity-40">
                                            {displayImages[lightboxIndex].width}*
                                            {displayImages[lightboxIndex].height}
                                        </p>
                                    )}
                            </div>
                        </div>

                        {/* Sliding Indicators */}
                        <div className="absolute left-1/2 -translate-x-1/2 overflow-x-auto no-scrollbar max-w-[200px] md:max-w-[400px]">
                            <div className="flex gap-2 md:gap-4 py-4">
                                {Array.from({ length: totalCount }, (_, i) => {
                                    const isLoaded = i < displayImages.length;
                                    const isActive = i === lightboxIndex;
                                    return (
                                        <button
                                            key={i}
                                            ref={(el) => {
                                                if (isActive && el) {
                                                    el.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
                                                }
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (isLoaded) setLightboxIndex(i);
                                            }}
                                            className={`h-px transition-all duration-500 rounded-full shrink-0 ${
                                                isActive
                                                    ? "w-8 md:w-16 bg-brand"
                                                    : isLoaded
                                                        ? "w-2 md:w-4 bg-white/10 hover:bg-white/30"
                                                        : "w-2 md:w-4 bg-white/5 cursor-default"
                                            }`}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Side: Page Count */}
                         <p className="text-white/20 text-[10px] font-black tracking-[1em] uppercase">
                            <span className="text-brand opacity-100">{String(lightboxIndex + 1).padStart(2, "0")}</span> /{" "}
                            {String(totalCount).padStart(2, "0")}
                        </p>
                    </div>


                </motion.div>
            )}
        </AnimatePresence>
    );
}



