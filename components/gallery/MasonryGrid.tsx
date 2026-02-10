import { motion } from "framer-motion";
import { Loader2, Play } from "lucide-react";
import Image from "next/image";
import { GalleryImage } from "@/types/gallery";
import { getYoutubeId } from "@/hooks/useGalleryData";

interface MasonryGridProps {
    groupedColumns: (GalleryImage & { globalIdx: number })[][];
    columnCount: number;
    imageRadius: number;
    setLightboxIndex: (index: number | null) => void;
    setIsAutoPlaying: (isPlaying: boolean) => void;
    lastImageRef: (node: HTMLDivElement) => void;
    displayImages: GalleryImage[];
    isLoading: boolean;
    isFetchingNextPage: boolean;
    hasNextPage: boolean;
}

export function MasonryGrid({
    groupedColumns,
    columnCount,
    imageRadius,
    setLightboxIndex,
    setIsAutoPlaying,
    lastImageRef,
    displayImages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
}: MasonryGridProps) {
    return (
        <section>
            <div
                className="grid gap-2 md:gap-3"
                style={{
                    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                }}
            >
                {groupedColumns.map((col, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-2 md:gap-3">
                        {col.map((img) => {
                            const globalIdx = img.globalIdx;
                            return (
                                <motion.div
                                    key={img.id}
                                    ref={
                                        globalIdx === displayImages.length - 1
                                            ? lastImageRef
                                            : null
                                    }
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.7,
                                        ease: [0.22, 1, 0.36, 1],
                                    }}
                                    onClick={() => {
                                        setLightboxIndex(globalIdx);
                                        setIsAutoPlaying(false);
                                    }}
                                    className="group relative w-full overflow-hidden bg-zinc-100 transition-all duration-500 md:hover:shadow-xl md:hover:shadow-black/10 cursor-zoom-in"
                                    style={{
                                        borderRadius: `${imageRadius}px`,
                                    }}
                                >
                                    {img.type === "video" || img.video_url ? (
                                        <div className="relative w-full h-full group-hover:scale-110 group-hover:brightness-110 transition-all duration-700 ease-out">
                                            {/* Mobile: Thumbnail + Play Icon */}
                                            <div className="block md:hidden w-full h-full relative">
                                                <Image
                                                    width={800}
                                                    height={
                                                        800 /
                                                        (img.aspect_ratio || 1)
                                                    }
                                                    className="w-full h-auto block"
                                                    style={{
                                                        aspectRatio:
                                                            img.aspect_ratio
                                                                ? `${img.aspect_ratio}`
                                                                : "auto",
                                                    }}
                                                    src={img.src}
                                                    alt={img.alt}
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
                                                    priority={globalIdx < 6}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 text-white shadow-lg">
                                                        <Play
                                                            size={20}
                                                            fill="currentColor"
                                                            className="ml-1"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Desktop: Auto-playing Video */}
                                            <div className="hidden md:block w-full h-full relative bg-black">
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    src={`https://www.youtube.com/embed/${getYoutubeId(img.video_url!)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${getYoutubeId(img.video_url!)}&playsinline=1&enablejsapi=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=0`}
                                                    title="YouTube grid player"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                    className="w-full h-full scale-[1.35] pointer-events-none"
                                                    style={{
                                                        aspectRatio:
                                                            img.aspect_ratio
                                                                ? `${img.aspect_ratio}`
                                                                : "16/9",
                                                    }}
                                                />
                                                <div className="absolute inset-0 z-10 bg-transparent" />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Image
                                                width={800}
                                                height={
                                                    800 / (img.aspect_ratio || 1)
                                                }
                                                className="w-full h-auto block transition-all duration-700 ease-out group-hover:scale-110"
                                                style={{
                                                    aspectRatio:
                                                        img.aspect_ratio
                                                            ? `${img.aspect_ratio}`
                                                            : "auto",
                                                }}
                                                src={img.src}
                                                alt={img.alt}
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
                                                priority={globalIdx < 6}
                                            />
                                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/50 transition-colors duration-500 pointer-events-none z-10" />
                                        </>
                                    )}

                                    <div className="absolute inset-x-0 bottom-0 p-2 z-20 opacity-0 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 flex items-end justify-start pointer-events-none md:p-2">
                                        <div className="bg-black/50 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none px-2 py-1 md:px-0 md:py-0 rounded md:rounded-none">
                                            <h3 className="text-[10px] md:text-sm font-bold tracking-widest md:tracking-[0.2em] opacity-90 uppercase text-white md:text-black underline decoration-1 underline-offset-4">
                                                {img.width && img.height
                                                    ? `${img.width}*${img.height}(PX)`
                                                    : ""}
                                            </h3>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {(isFetchingNextPage || isLoading) && (
                <div className="w-full flex flex-col items-center justify-center py-24 gap-6">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="text-foreground/20"
                    >
                        <Loader2 size={48} />
                    </motion.div>
                    <p className="text-[10px] font-black tracking-[0.5em] uppercase opacity-40">
                        Loading Archives
                    </p>
                </div>
            )}

            {!hasNextPage && !isLoading && (
                <div className="w-full flex flex-col items-center justify-center py-32 opacity-20">
                    <div className="w-24 h-px bg-foreground mb-8" />
                    <p className="text-[10px] font-black tracking-[1em] uppercase">
                        Complete Archive Reached
                    </p>
                </div>
            )}

            {!isLoading && displayImages.length === 0 && (
                <div className="w-full flex flex-col items-center justify-center py-32 opacity-40">
                    <p className="text-[10px] font-black tracking-[1em] uppercase">
                        No Images Found
                    </p>
                </div>
            )}
        </section>
    );
}
