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
                    { id: 0, title: "Modern Serenity", description: "Redefining contemporary living spaces", src: "/images/image_1.jpg" },
                    { id: 1, title: "Urban Harmony", description: "Integrated architectural solutions", src: "/images/image_2.jpg" },
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

    return (
        <main className="min-h-screen bg-background font-sans selection:bg-foreground selection:text-background overflow-x-hidden">
            <Navigation />

            <div className="max-w-[1920px] mx-auto px-4 md:px-12 lg:px-24 py-12 flex flex-col gap-12 md:gap-24">
                {/* Professional Banner Carousel */}
                <section className="relative h-[450px] md:h-[700px] w-full overflow-hidden group">
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
                                    alt={bannerItems[currentIndex]?.title || "Banner"}
                                    priority
                                />
                            <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent z-10" />
                            <div className="relative z-20 text-center text-white px-6 max-w-5xl">
                                <motion.div
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 1 }}
                                >
                                    <span className="text-[10px] md:text-sm font-bold tracking-[0.5em] uppercase mb-6 md:mb-8 block opacity-60">
                                        Visionary Space
                                    </span>
                                    <h1 className="text-5xl md:text-[10rem] font-black tracking-tighter mb-8 md:mb-12 uppercase leading-[0.85] drop-shadow-2xl">
                                        {bannerItems[currentIndex]?.title}
                                    </h1>
                                    <p className="text-lg md:text-2xl text-white/60 font-light leading-relaxed tracking-wide max-w-2xl mx-auto backdrop-blur-xs py-2">
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
                                className="p-6 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 text-white hover:bg-white/20 hover:scale-110 active:scale-95 transition-all duration-300"
                            >
                                <ChevronLeft size={32} />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="p-6 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 text-white hover:bg-white/20 hover:scale-110 active:scale-95 transition-all duration-300"
                            >
                                <ChevronRight size={32} />
                            </button>
                        </div>
                    )}

                    {bannerItems.length > 0 && (
                        <div className="absolute bottom-10 md:bottom-16 left-1/2 -translate-x-1/2 md:left-24 md:translate-x-0 flex items-center gap-4 z-35">
                            {bannerItems.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentIndex(i)}
                                    className={`h-1.5 transition-all duration-[1000ms] rounded-full ${i === currentIndex ? "w-24 md:w-40 bg-white" : "w-3 md:w-6 bg-white/10 hover:bg-white/30"}`}
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
                        <div className="flex flex-wrap gap-3">
                            {["All", "Exterior", "Interior"].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-8 py-3.5 text-[10px] md:text-xs font-black tracking-[0.2em] uppercase rounded-full transition-all duration-700 flex items-center gap-2 ${
                                        selectedCategory === cat
                                            ? "bg-foreground text-background shadow-2xl shadow-black/20 scale-105"
                                            : "bg-zinc-100 text-muted-foreground hover:bg-zinc-200 hover:text-foreground"
                                    }`}
                                >
                                    {cat}
                                    <span
                                        className={`w-1 h-1 rounded-full ${selectedCategory === cat ? "bg-background" : "bg-transparent"}`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: { staggerChildren: 0.1 },
                            },
                        }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-10"
                    >
                        <AnimatePresence mode="popLayout">
                            {displayImages.map((img, idx) => (
                                <motion.div
                                    key={`${img.id}-${selectedCategory}-${idx}`}
                                    ref={
                                        idx === displayImages.length - 1
                                            ? lastImageRef
                                            : null
                                    }
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{
                                        duration: 0.8,
                                        ease: [0.22, 1, 0.36, 1],
                                        delay: (idx % 12) * 0.08, // Staggered one-by-one effect
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
                                            <h3 className="text-xl md:text-2xl font-light leading-tight tracking-tight mb-3">
                                                {img.alt}
                                            </h3>
                                            <div className="h-[1px] w-0 group-hover:w-full bg-white/20 transition-all duration-700 delay-200" />
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
                        </AnimatePresence>
                    </motion.div>

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
                        <div className="absolute top-0 inset-x-0 h-24 md:h-32 px-6 md:px-16 flex items-center justify-between z-60 bg-linear-to-b from-black/80 to-transparent">
                            <div className="text-white">
                                <p className="text-[9px] md:text-[10px] font-black tracking-[0.5em] uppercase opacity-40 mb-2">
                                    {displayImages[lightboxIndex].category} •
                                    Collection
                                </p>
                                <h2 className="text-lg md:text-3xl font-light tracking-tighter truncate max-w-[200px] md:max-w-none">
                                    {displayImages[lightboxIndex].alt}
                                </h2>
                            </div>
                            <div className="flex items-center gap-4 md:gap-10">
                                <button
                                    onClick={() =>
                                        setIsAutoPlaying(!isAutoPlaying)
                                    }
                                    className={`flex items-center gap-3 px-5 md:px-10 py-3 md:py-4 rounded-full border transition-all duration-500 scale-90 md:scale-100 ${
                                        isAutoPlaying
                                            ? "bg-white text-black border-white shadow-2xl"
                                            : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                                    }`}
                                >
                                    {isAutoPlaying ? (
                                        <Pause size={18} fill="currentColor" />
                                    ) : (
                                        <Play size={18} fill="currentColor" />
                                    )}
                                    <span className="text-[10px] md:text-xs font-black tracking-[0.3em] uppercase">
                                        {isAutoPlaying ? "Stop" : "Play"}
                                    </span>
                                </button>
                                <button
                                    onClick={() => setLightboxIndex(null)}
                                    className="p-4 md:p-6 bg-white/5 rounded-full text-white hover:bg-white/10 hover:rotate-90 transition-all duration-500 border border-white/10"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Main Image Container */}
                        <div className="flex-1 relative flex items-center justify-center p-4 md:p-16">
                            <button
                                onClick={prevLightbox}
                                className="absolute left-10 md:left-20 z-60 p-8 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/20 hover:scale-110 active:scale-90 transition-all duration-500 hidden lg:block"
                            >
                                <ChevronLeft size={48} />
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
                                className="absolute right-10 md:right-20 z-60 p-8 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/20 hover:scale-110 active:scale-90 transition-all duration-500 hidden lg:block"
                            >
                                <ChevronRight size={48} />
                            </button>
                        </div>

                        {/* Lightbox Footer & Immersive Progress */}
                        <div className="absolute bottom-0 inset-x-0 h-24 md:h-32 px-6 md:px-16 flex flex-col justify-end pb-10 md:pb-16 bg-linear-to-t from-black/80 to-transparent">
                            <div className="flex justify-center gap-2 md:gap-3 mb-6 overflow-x-auto no-scrollbar py-4 max-w-2xl mx-auto">
                                {displayImages.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setLightboxIndex(i)}
                                        className={`h-[2px] transition-all duration-700 rounded-full flex-shrink-0 ${
                                            i === lightboxIndex
                                                ? "w-16 md:w-24 bg-white"
                                                : "w-2 md:w-4 bg-white/10 hover:bg-white/30"
                                        }`}
                                    />
                                ))}
                            </div>
                            <p className="text-center text-white/30 text-[9px] md:text-[10px] font-black tracking-[0.8em] uppercase">
                                {String(lightboxIndex + 1).padStart(2, "0")} —{" "}
                                {String(displayImages.length).padStart(2, "0")}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
