"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Share2,
    X,
    Loader2,
    Play,
    Filter,
    Pause,
} from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface Category {
    id: string;
    name: string;
}

interface GalleryImage {
    id: string;
    src: string;
    alt: string;
    category_id: string;
    category_name?: string;
    type?: string;
    video_url?: string;
    width?: number;
    height?: number;
    aspect_ratio?: number;
    display_order?: number;
}

interface GalleryViewProps {
    initialImages: GalleryImage[];
    nextCursor: number | null;
}

// Real Supabase Data Fetching
const fetchGalleryPage = async ({
    pageParam = 0,
    categoryId = "All",
    categoriesMap = {} as Record<string, string>,
}): Promise<{ images: GalleryImage[]; nextCursor: number | null }> => {
    if (!supabase) return { images: [], nextCursor: null };

    const itemsPerPage = 50;
    const from = pageParam * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let query = supabase
        .from("gallery")
        .select("*", { count: "exact" })
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false })
        .range(from, to);

    if (categoryId !== "All") {
        query = query.eq("category_id", categoryId);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error("Supabase fetch error:", error);
        throw error;
    }

    const images =
        data?.map((item: any) => {
            return {
                id: item.id,
                src: item.src,
                alt: item.title,
                category_id: item.category_id,
                category_name: categoriesMap[item.category_id] || "Uncategorized",
                type: item.type,
                video_url: item.video_url,
                width: item.width,
                height: item.height,
                aspect_ratio: item.aspect_ratio,
                display_order: item.display_order,
            };
        }) || [];

    const hasNext = count ? from + itemsPerPage < count : false;

    return {
        images,
        nextCursor: hasNext ? pageParam + 1 : null,
    };
};

// Helper to extract YouTube ID
const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

export function GalleryView({ initialImages, nextCursor }: GalleryViewProps) {
    const [selectedCategoryId, setSelectedCategoryId] = useState("All");
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesMap, setCategoriesMap] = useState<Record<string, string>>({});

    // 카테고리 목록 로드
    useEffect(() => {
        async function fetchCategories() {
            if (!supabase) return;
            const { data } = await supabase
                .from("categories")
                .select("id, name")
                .order("display_order", { ascending: true });
            if (data) {
                setCategories(data);
                const map: Record<string, string> = {};
                data.forEach((c: Category) => { map[c.id] = c.name; });
                setCategoriesMap(map);
            }
        }
        fetchCategories();
    }, []);

    // React Query for professional caching & state management
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
        useInfiniteQuery({
            queryKey: ["gallery", selectedCategoryId, categoriesMap],
            queryFn: ({ pageParam }) =>
                fetchGalleryPage({ pageParam, categoryId: selectedCategoryId, categoriesMap }),
            initialPageParam: 0,
            getNextPageParam: (lastPage) => lastPage.nextCursor,
            staleTime: 1000 * 60 * 10, // Cache for 10 minutes
            initialData: selectedCategoryId === "All" && Object.keys(categoriesMap).length === 0 ? {
                pages: [{ images: initialImages, nextCursor }],
                pageParams: [0],
            } : undefined,
        });

    const displayImages = useMemo(() => {
        return data?.pages.flatMap((page) => page.images) ?? [];
    }, [data]);

    // Column count based on screen size and site settings
    const [columnCount, setColumnCount] = useState(1);
    const [columnSettings, setColumnSettings] = useState({
        mobile: 1,
        tablet: 2,
        desktop: 4,
        wide: 5,
    });
    const [imageRadius, setImageRadius] = useState(0);

    // 그리드 설정 로드
    useEffect(() => {
        async function loadColumnSettings() {
            if (!supabase) return;
            try {
                const { data } = await supabase
                    .from("site_settings")
                    .select("value")
                    .eq("key", "gallery_columns")
                    .single();

                const { data: radiusData } = await supabase
                    .from("site_settings")
                    .select("value")
                    .eq("key", "gallery_image_radius")
                    .single();
                
                if (data?.value) {
                    setColumnSettings(data.value);
                }

                if (radiusData?.value) {
                    setImageRadius(Number(radiusData.value) || 0);
                }
            } catch (e) {
                console.error("Settings load failed:", e);
            }
        }
        loadColumnSettings();
    }, []);

    useEffect(() => {
        const updateColumns = () => {
            const width = window.innerWidth;
            if (width >= 1536) setColumnCount(columnSettings.wide);
            else if (width >= 1280) setColumnCount(columnSettings.desktop);
            else if (width >= 1024) setColumnCount(Math.max(columnSettings.tablet, 2));
            else if (width >= 640) setColumnCount(columnSettings.tablet);
            else setColumnCount(columnSettings.mobile);
        };
        updateColumns();
        window.addEventListener("resize", updateColumns);
        return () => window.removeEventListener("resize", updateColumns);
    }, [columnSettings]);

    // Distribute images into columns (Shortest column first logic)
    const groupedColumns = useMemo(() => {
        const cols = Array.from({ length: columnCount }, () => [] as (GalleryImage & { globalIdx: number })[]);
        const heights = new Array(columnCount).fill(0);

        displayImages.forEach((img, idx) => {
            const columnIndex = idx % columnCount;
            cols[columnIndex].push({ ...img, globalIdx: idx });
        });

        return cols;
    }, [displayImages, columnCount]);

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

    const nextLightbox = useCallback(() => {
        setLightboxIndex((prev) =>
            prev !== null ? (prev + 1) % displayImages.length : null,
        );
    }, [displayImages.length]);

    const prevLightbox = useCallback(() => {
        setLightboxIndex((prev) =>
            prev !== null
                ? (prev - 1 + displayImages.length) % displayImages.length
                : null,
        );
    }, [displayImages.length]);

    // Keyboard controls for Lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex === null) return;
            if (e.key === "Escape") setLightboxIndex(null);
            if (e.key === "ArrowRight") nextLightbox();
            if (e.key === "ArrowLeft") prevLightbox();
            if (e.key === " ") {
                e.preventDefault();
                setIsAutoPlaying((prev) => !prev);
            }
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

    return (
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 py-24 flex flex-col gap-24">
            <section>
                <div className="flex flex-col xl:flex-row xl:items-end justify-between mb-12 md:mb-20 gap-8">
                    <div className="border-l-8 border-brand pl-6 md:pl-10">
                        <h2 className="text-5xl md:text-8xl font-light tracking-tighter mb-4 uppercase leading-none">
                            {selectedCategoryId === "All" ? "Archive" : categoriesMap[selectedCategoryId] || "Archive"}
                        </h2>
                        <p className="text-xs md:text-sm font-bold tracking-[0.3em] text-muted-foreground uppercase opacity-50">
                            Precision • Aesthetics • Innovation
                        </p>
                    </div>
                    <div className="flex flex-nowrap gap-2 md:gap-4 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2 md:mx-0 md:px-0 items-center">
                        <div className="flex items-center gap-2 mr-2 shrink-0">
                            <Filter size={14} className="opacity-40" />
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-20">Filter By</span>
                        </div>
                        <button
                            key="All"
                            onClick={() => setSelectedCategoryId("All")}
                            className={`px-4 md:px-6 py-2 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full transition-all duration-700 flex items-center gap-2 whitespace-nowrap shrink-0 ${
                                    selectedCategoryId === "All"
                                        ? "bg-brand text-foreground shadow-2xl shadow-brand/20"
                                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategoryId(cat.id)}
                                className={`px-4 md:px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-500 whitespace-nowrap ${
                                    selectedCategoryId === cat.id
                                        ? "bg-brand text-foreground shadow-2xl shadow-brand/20"
                                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedCategoryId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {displayImages.length > 0 ? (
                            <div 
                                className="grid gap-2 md:gap-3"
                                style={{ 
                                    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` 
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
                                                    style={{ borderRadius: `${imageRadius}px` }}
                                                >
                                                    {(img.type === 'video' || img.video_url) ? (
                                                        <div 
                                                            className="relative w-full overflow-hidden bg-black"
                                                            style={{ 
                                                                aspectRatio: img.aspect_ratio ? `${img.aspect_ratio}` : '16/9'
                                                            }}
                                                        >
                                                            <div className="absolute inset-0 z-0 pointer-events-none">
                                                                <iframe
                                                                    width="100%"
                                                                    height="100%"
                                                                    src={`https://www.youtube.com/embed/${getYoutubeId(img.video_url!)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${getYoutubeId(img.video_url!)}&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0&vq=hd1080`}
                                                                    title="YouTube grid player"
                                                                    frameBorder="0"
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                                    className="w-full h-full scale-150 pointer-events-none"
                                                                />
                                                            </div>
                                                            {/* Transparent Overlay to block interaction on grid */}
                                                            <div className="absolute inset-0 z-10 bg-transparent" />
                                                        </div>
                                                    ) : (
                                                        <Image
                                                            width={800}
                                                            height={800 / (img.aspect_ratio || 1)}
                                                            className="w-full h-auto block transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
                                                            style={{ 
                                                                aspectRatio: img.aspect_ratio ? `${img.aspect_ratio}` : 'auto'
                                                            }}
                                                            src={img.src}
                                                            alt={img.alt}
                                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
                                                            priority={globalIdx < 6}
                                                        />
                                                    )}

                                                    <div className="absolute inset-x-0 bottom-0 p-2 opacity-100 md:inset-0 md:bg-white/40 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 flex items-end justify-end pointer-events-none md:p-2">
                                                        <div className="bg-black/50 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none px-2 py-1 md:px-0 md:py-0 rounded md:rounded-none">
                                                            <h3 className="text-[10px] md:text-sm font-bold tracking-widest md:tracking-[0.2em] opacity-90 uppercase text-white md:text-black underline decoration-1 underline-offset-4">
                                                                {img.width && img.height ? `${img.width}*${img.height}(PX)` : ''}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            !isLoading && (
                                <div className="w-full flex flex-col items-center justify-center py-32 opacity-40">
                                    <p className="text-[10px] font-black tracking-[1em] uppercase">
                                        No Images Found
                                    </p>
                                </div>
                            )
                        )}
                    </motion.div>
                </AnimatePresence>

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
            </section>

            <AnimatePresence>
                {lightboxIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed min-h-dvh inset-0 z-150 bg-zinc-950/98 backdrop-blur-3xl flex flex-col"
                    >
                        <div className="absolute top-0 inset-x-0 h-20 md:h-24 px-6 md:px-20 flex items-center justify-between z-60">
                            <div className="text-white">
                                <p className="text-[10px] font-black tracking-[1em] uppercase opacity-30 mb-1">
                                    {displayImages[lightboxIndex].category_name}
                                </p>
                                <h2 className="text-sm md:text-base font-medium tracking-[0.2em] uppercase truncate max-w-[200px] md:max-w-none opacity-80">
                                    {displayImages[lightboxIndex].alt}
                                </h2>
                            </div>
                            <div className="flex items-center gap-4 md:gap-6">
                                <button
                                    onClick={() =>
                                        setIsAutoPlaying(!isAutoPlaying)
                                    }
                                    className={`flex items-center gap-3 px-6 py-2 rounded-full border transition-all duration-500 ${
                                        isAutoPlaying
                                            ? "bg-white text-black border-white shadow-xl"
                                            : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                                    }`}
                                >
                                    {isAutoPlaying ? (
                                        <Pause
                                            size={14}
                                            fill="currentColor"
                                        />
                                    ) : (
                                        <Play
                                            size={14}
                                            fill="currentColor"
                                        />
                                    )}
                                    <span className="text-[10px] font-black tracking-[0.2em] uppercase">
                                        {isAutoPlaying ? "Pause" : "Play"}
                                    </span>
                                </button>
                                <button
                                    onClick={() => setLightboxIndex(null)}
                                    className="p-3 md:p-4 bg-white/5 rounded-full text-white hover:bg-white/10 hover:rotate-90 transition-all duration-500 border border-white/10"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 relative flex items-center justify-center">
                            <button
                                onClick={prevLightbox}
                                className="absolute left-8 md:left-12 z-60 p-5 rounded-full bg-white/5 border border-white/5 text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-500 hidden lg:block"
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
                                    <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
                                        {displayImages[lightboxIndex].video_url ? (
                                            <div className="relative w-full h-full max-w-6xl aspect-video overflow-hidden shadow-2xl bg-black">
                                                <div className="absolute inset-0 z-0">
                                                    <iframe
                                                        width="100%"
                                                        height="100%"
                                                        src={`https://www.youtube.com/embed/${getYoutubeId(displayImages[lightboxIndex].video_url!)}?autoplay=1&controls=0&modestbranding=1&rel=0&disablekb=1&iv_load_policy=3&showinfo=0&mute=0&vq=hd1080`}
                                                        title="YouTube video player"
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                        allowFullScreen
                                                        className="w-full h-full scale-[1.3] origin-center"
                                                    />
                                                </div>
                                                {/* Transparent Interaction Overlay (Tailwind implementation) */}
                                                <div className="absolute inset-0 z-10 bg-transparent cursor-default" />
                                            </div>
                                        ) : (
                                            <Image
                                                fill={true}
                                                className="object-contain"
                                                src={
                                                    displayImages[lightboxIndex]
                                                        .src
                                                }
                                                alt={
                                                    displayImages[lightboxIndex]
                                                        .alt
                                                }
                                                priority
                                            />
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            <button
                                onClick={nextLightbox}
                                className="absolute right-8 md:right-12 z-60 p-5 rounded-full bg-white/5 border border-white/5 text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-500 hidden lg:block"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        <div className="absolute bottom-0 inset-x-0 h-24 md:h-32 px-6 md:px-16 flex flex-col justify-end pb-8 md:pb-12">
                            <div className="flex items-center gap-2 mb-12">
                                <Filter size={14} className="opacity-40" />
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-20">Filter By</span>
                            </div>
                            <div className="flex justify-center gap-4 md:gap-8 overflow-x-auto no-scrollbar py-4 max-w-xl mx-auto">
                                {displayImages.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setLightboxIndex(i)}
                                        className={`h-px transition-all duration-700 rounded-full shrink-0 ${
                                            i === lightboxIndex
                                                ? "w-12 md:w-16 bg-white"
                                                : "w-2 md:w-4 bg-white/10 hover:bg-white/30"
                                        }`}
                                    />
                                ))}
                            </div>
                            <p className="text-center text-white/20 text-[10px] font-black tracking-[1em] uppercase">
                                {String(lightboxIndex + 1).padStart(2, "0")}{" "}
                                /{" "}
                                {String(displayImages.length).padStart(
                                    2,
                                    "0",
                                )}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
