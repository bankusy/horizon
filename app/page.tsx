"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Navigation from "@/components/Navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Pause,
    Play,
    Share2,
    X,
    Loader2,
} from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import BlurText from "@/components/BlurText";

interface GalleryImage {
    id: string | number;
    src: string;
    alt: string;
    category: string;
}

// Real Supabase Data Fetching
const fetchGalleryPage = async ({
    pageParam = 0,
    category = "All",
}): Promise<{ images: GalleryImage[]; nextCursor: number | null }> => {
    if (!supabase) return { images: [], nextCursor: null };

    const itemsPerPage = 12;
    const from = pageParam * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let query = supabase
        .from("gallery")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

    if (category !== "All") {
        query = query.eq("category", category);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error("Supabase fetch error:", error);
        throw error;
    }

    const images =
        data?.map((item: any) => ({
            id: item.id,
            src: item.src,
            alt: item.title,
            category: item.category,
        })) || [];

    const hasNext = count ? from + itemsPerPage < count : false;

    return {
        images,
        nextCursor: hasNext ? pageParam + 1 : null,
    };
};

export default function Home() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);

    // React Query for professional caching & state management
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
        useInfiniteQuery({
            queryKey: ["gallery", selectedCategory],
            queryFn: ({ pageParam }) =>
                fetchGalleryPage({ pageParam, category: selectedCategory }),
            initialPageParam: 0,
            getNextPageParam: (lastPage) => lastPage.nextCursor,
            staleTime: 1000 * 60 * 10, // Cache for 10 minutes
        });

    const displayImages = useMemo(() => {
        return data?.pages.flatMap((page) => page.images) ?? [];
    }, [data]);

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

    const [currentIndex, setCurrentIndex] = useState(0);
    const [bannerItems, setBannerItems] = useState<any[]>([]);

    // Fetch Banners from Supabase
    useEffect(() => {
        const fetchBanners = async () => {
            if (!supabase) return;
            const { data, error } = await supabase
                .from("banners")
                .select("*")
                .order("created_at", { ascending: false });

            if (!error && data && data.length > 0) {
                setBannerItems(data);
            } else {
                // Fallback to default if no banners registered
                setBannerItems([
                    {
                        id: 0,
                        title: "Modern Serenity",
                        description: "Redefining contemporary living spaces",
                        src: "/images/image_1.jpg",
                    },
                    {
                        id: 1,
                        title: "Urban Harmony",
                        description: "Integrated architectural solutions",
                        src: "/images/image_2.jpg",
                    },
                ]);
            }
        };
        fetchBanners();
    }, []);

    // Banner Auto-play
    useEffect(() => {
        if (bannerItems.length === 0) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % bannerItems.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [bannerItems.length]);

    // Lightbox Auto-play
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

    const nextSlide = () =>
        setCurrentIndex((prev) => (prev + 1) % bannerItems.length);
    const prevSlide = () =>
        setCurrentIndex(
            (prev) => (prev - 1 + bannerItems.length) % bannerItems.length,
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

    const [assetsLoaded, setAssetsLoaded] = useState(false);
    const [logoLoaded, setLogoLoaded] = useState(false);

    // Initial loading effect
    useEffect(() => {
        if (logoLoaded && bannerItems.length > 0) {
            const timer = setTimeout(() => setAssetsLoaded(true), 500);
            return () => clearTimeout(timer);
        }
    }, [logoLoaded, bannerItems.length]);

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
        <main className="min-h-screen bg-background font-sans selection:bg-background selection:text-foreground overflow-x-hidden">
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{
                    opacity: assetsLoaded ? 1 : 0,
                    y: assetsLoaded ? 0 : -20,
                }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="w-full bg-background pt-20 md:pt-24 pb-16 md:pb-24 border-b border-border/50"
            >
                <div className="w-full px-6 md:px-12 lg:px-20 mx-auto flex flex-col items-center lg:flex-row justify-between lg:items-end gap-14 lg:gap-6 text-center lg:text-right">
                    <div className="flex flex-col items-center lg:items-start relative lg:right-1.5">
                        <h1 className="flex items-center justify-center lg:justify-start gap-2 min-[400px]:gap-4 text-5xl min-[400px]:text-6xl sm:text-7xl lg:text-8xl font-medium tracking-tighter leading-none">
                            <div className="flex-shrink-0">
                                <Image
                                    width={128}
                                    height={128}
                                    src={"/logo.svg"}
                                    alt="logo"
                                    priority
                                    onLoad={(e) => {
                                        if (e.currentTarget.complete)
                                            setLogoLoaded(true);
                                    }}
                                    className="w-16 min-[400px]:w-20 md:w-32 lg:w-40"
                                />
                            </div>
                            <BlurText
                                text="HORIZON"
                                delay={1000}
                                animateBy="words"
                                direction="top"
                                className="text-5xl min-[400px]:text-6xl sm:text-7xl lg:text-8xl font-medium tracking-tighter"
                            />
                            {/* Spacer to perfectly center the title on mobile/tablet */}
                            <div 
                                className="lg:hidden w-16 min-[400px]:w-20 md:w-32 flex-shrink-0 invisible" 
                                aria-hidden="true" 
                            />
                        </h1>
                    </div>
                    <div className="flex flex-col items-center lg:items-end lg:text-right gap-1.5 text-[9px] sm:text-[10px] md:text-sm font-light text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.3em] lg:tracking-widest">
                        <p className="font-bold text-foreground tracking-normal">
                            JEONG WON SIK
                        </p>
                        <div className="flex flex-col items-center lg:items-end gap-1 opacity-60">
                            <p>+82 10 - 3500 - 7742</p>
                            <p>cghrn@naver.com</p>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Professional Banner Carousel - Full Width */}
            <section className="relative h-[60vh] md:h-[85vh] w-full overflow-hidden group bg-muted/20">
                {!assetsLoaded && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground/30" />
                            <p className="text-[10px] tracking-[0.5em] text-muted-foreground/40 uppercase">
                                Loading Experience
                            </p>
                        </div>
                    </div>
                )}
                {bannerItems.length > 0 && (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                            className="absolute inset-0 flex items-center justify-center bg-zinc-950"
                        >
                            <Image
                                fill={true}
                                className="object-cover opacity-50 transition-transform duration-[3000ms] group-hover:scale-105"
                                src={bannerItems[currentIndex]?.src || ""}
                                alt={
                                    bannerItems[currentIndex]?.title || "Banner"
                                }
                                priority
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent z-10" />
                            <div className="relative z-20 text-center text-white px-6 max-w-5xl">
                                <motion.div
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 1 }}
                                >
                                    <span className="text-[10px] md:text-xs font-bold tracking-[1em] uppercase mb-4 md:mb-6 block opacity-40">
                                        Visionary Space
                                    </span>
                                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 md:mb-10 uppercase leading-[0.85] drop-shadow-2xl">
                                        {bannerItems[currentIndex]?.title}
                                    </h1>
                                    <p className="text-base md:text-lg text-white/50 font-medium leading-relaxed tracking-wide max-w-xl mx-auto backdrop-blur-xs py-2">
                                        {bannerItems[currentIndex]?.description}
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                )}

                {bannerItems.length > 0 && (
                    <div className="absolute inset-0 hidden lg:flex items-center justify-between px-16 z-30 opacity-0 group-hover:opacity-100 transition-all duration-700">
                        <button
                            onClick={prevSlide}
                            className="p-4 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-500"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="p-4 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-500"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                )}

                {bannerItems.length > 0 && (
                    <div className="absolute bottom-10 md:bottom-16 left-1/2 -translate-x-1/2 md:left-24 md:translate-x-0 flex items-center gap-4 z-35">
                        {bannerItems.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className={`h-px transition-all duration-[1000ms] rounded-full ${i === currentIndex ? "w-16 md:w-32 bg-white" : "w-2 md:w-4 bg-white/20 hover:bg-white/40"}`}
                            />
                        ))}
                    </div>
                )}

                {bannerItems.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/20">
                        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                    </div>
                )}
            </section>

            {/* Constrained Content (Gallery, etc.) */}
            <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 py-24 flex flex-col gap-24">
                {/* Animated Grid Segment */}
                <section>
                    <div className="flex flex-col xl:flex-row xl:items-end justify-between mb-12 md:mb-20 gap-8">
                        <div className="border-l-8 border-foreground pl-6 md:pl-10">
                            <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-4 uppercase leading-none">
                                Archives
                            </h2>
                            <p className="text-xs md:text-sm font-bold tracking-[0.3em] text-muted-foreground uppercase opacity-50">
                                Precision • Aesthetics • Innovation
                            </p>
                        </div>
                        <div className="flex flex-nowrap gap-3 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2 md:mx-0 md:px-0">
                            {["All", "Exterior", "Interior"].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-6 py-2.5 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full transition-all duration-700 flex items-center gap-2 border whitespace-nowrap flex-shrink-0 ${
                                        selectedCategory === cat
                                            ? "bg-foreground text-background border-foreground shadow-xl shadow-black/10 scale-105"
                                            : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground"
                                    }`}
                                >
                                    <span
                                        className={`w-1 h-px ${selectedCategory === cat ? "bg-background" : "bg-transparent"}`}
                                    />
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedCategory}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {displayImages.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-10">
                                    {displayImages.map((img, idx) => (
                                        <motion.div
                                            key={`${img.id}-${idx}`}
                                            ref={
                                                idx === displayImages.length - 1
                                                    ? lastImageRef
                                                    : null
                                            }
                                            layout
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{
                                                duration: 0.7,
                                                ease: [0.22, 1, 0.36, 1],
                                                delay: (idx % 12) * 0.05,
                                            }}
                                            onClick={() => {
                                                setLightboxIndex(idx);
                                                setIsAutoPlaying(false);
                                            }}
                                            className="group relative aspect-3/4 w-full overflow-hidden bg-zinc-50 transition-all duration-500 md:hover:shadow-xl md:hover:shadow-black/10 cursor-zoom-in"
                                        >
                                            <Image
                                                fill={true}
                                                className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                                                src={img.src}
                                                alt={img.alt}
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 20vw"
                                            />

                                            {/* High-End Information Overlay */}
                                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/0 to-transparent opacity-0 md:group-hover:opacity-100 transition-all duration-500">
                                                <div className="absolute top-6 right-6 flex gap-3 translate-y-2 group-hover:translate-y-0 transition-all duration-500 opacity-0 group-hover:opacity-100">
                                                    <button className="p-3 rounded-full bg-white/10 backdrop-blur-xl text-white hover:bg-white/30 transition-all border border-white/20">
                                                        <Share2 size={18} />
                                                    </button>
                                                    <button className="p-3 rounded-full bg-white/10 backdrop-blur-xl text-white hover:bg-white/30 transition-all border border-white/20">
                                                        <Maximize2 size={18} />
                                                    </button>
                                                </div>
                                                <div className="absolute bottom-8 left-8 right-8 text-white md:translate-y-2 md:group-hover:translate-y-0 transition-all duration-700 delay-75">
                                                    <p className="text-[9px] font-bold tracking-[0.3em] uppercase opacity-40 mb-2">
                                                        {img.category}
                                                    </p>
                                                    <h3 className="text-xl md:text-2xl font-medium leading-tight tracking-tight mb-3">
                                                        {img.alt}
                                                    </h3>
                                                    <div className="h-px w-0 group-hover:w-full bg-white/20 transition-all duration-700 delay-200" />
                                                </div>
                                            </div>

                                            {/* Mobile Responsive Header Tag */}
                                            <div className="absolute top-4 left-4 md:hidden">
                                                <div className="bg-black/60 backdrop-blur-xl px-4 py-2 border border-white/10">
                                                    <p className="text-[9px] font-black tracking-widest text-white uppercase">
                                                        {img.category}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
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

                    {/* Infinite Loading Logic & Visuals */}
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
                            <div className="w-24 h-[1px] bg-foreground mb-8" />
                            <p className="text-[10px] font-black tracking-[1em] uppercase">
                                Complete Archive Reached
                            </p>
                        </div>
                    )}
                </section>
            </div>

            {/* Immersive Full-Screen Lightbox */}
            <AnimatePresence>
                {lightboxIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-zinc-950/98 backdrop-blur-3xl flex flex-col"
                    >
                        {/* Lightbox Header */}
                        <div className="absolute top-0 inset-x-0 h-20 md:h-24 px-6 md:px-20 flex items-center justify-between z-60">
                            <div className="text-white">
                                <p className="text-[10px] font-black tracking-[1em] uppercase opacity-30 mb-1">
                                    {displayImages[lightboxIndex].category}
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
                                        <Pause size={14} fill="currentColor" />
                                    ) : (
                                        <Play size={14} fill="currentColor" />
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

                        {/* Main Image Container */}
                        <div className="flex-1 relative flex items-center justify-center p-4 md:p-16">
                            <button
                                onClick={prevLightbox}
                                className="absolute left-8 md:left-12 z-60 p-5 rounded-full bg-white/5 border border-white/5 text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-500 hidden lg:block"
                            >
                                <ChevronLeft size={24} />
                            </button>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={lightboxIndex}
                                    initial={{
                                        opacity: 0,
                                        scale: 0.9,
                                        filter: "blur(20px)",
                                    }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        filter: "blur(0px)",
                                    }}
                                    exit={{
                                        opacity: 0,
                                        scale: 1.1,
                                        filter: "blur(20px)",
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        ease: [0.22, 1, 0.36, 1],
                                    }}
                                    className="relative w-full h-full max-w-[90vw] max-h-[70vh] md:max-h-[85vh]"
                                >
                                    <Image
                                        fill={true}
                                        className="object-contain"
                                        src={displayImages[lightboxIndex].src}
                                        alt={displayImages[lightboxIndex].alt}
                                        priority
                                    />
                                </motion.div>
                            </AnimatePresence>

                            <button
                                onClick={nextLightbox}
                                className="absolute right-8 md:right-12 z-60 p-5 rounded-full bg-white/5 border border-white/5 text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-500 hidden lg:block"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        {/* Lightbox Footer & Immersive Progress */}
                        <div className="absolute bottom-0 inset-x-0 h-24 md:h-32 px-6 md:px-16 flex flex-col justify-end pb-8 md:pb-12">
                            <div className="flex justify-center gap-1.5 md:gap-2 mb-6 overflow-x-auto no-scrollbar py-4 max-w-xl mx-auto">
                                {displayImages.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setLightboxIndex(i)}
                                        className={`h-px transition-all duration-700 rounded-full flex-shrink-0 ${
                                            i === lightboxIndex
                                                ? "w-12 md:w-16 bg-white"
                                                : "w-2 md:w-4 bg-white/10 hover:bg-white/30"
                                        }`}
                                    />
                                ))}
                            </div>
                            <p className="text-center text-white/20 text-[10px] font-black tracking-[1em] uppercase">
                                {String(lightboxIndex + 1).padStart(2, "0")} /{" "}
                                {String(displayImages.length).padStart(2, "0")}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
