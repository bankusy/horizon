"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface BannerItem {
    id: string | number;
    title: string;
    description: string;
    src: string;
}

interface BannerCarouselProps {
    initialBanners: BannerItem[];
}

export function BannerCarousel({ initialBanners }: BannerCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [bannerItems, setBannerItems] = useState<BannerItem[]>(initialBanners);
    const [assetsLoaded, setAssetsLoaded] = useState(false);

    useEffect(() => {
        if (bannerItems.length > 0) {
            setAssetsLoaded(true);
        }
    }, [bannerItems]);

    // Banner Auto-play
    useEffect(() => {
        if (bannerItems.length === 0) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % bannerItems.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [bannerItems.length, currentIndex]);

    const nextSlide = () =>
        setCurrentIndex((prev) => (prev + 1) % bannerItems.length);
    const prevSlide = () =>
        setCurrentIndex(
            (prev) => (prev - 1 + bannerItems.length) % bannerItems.length,
        );

    if (bannerItems.length === 0) {
        return (
            <section className="relative aspect-video w-full flex items-center justify-center bg-zinc-950/20">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </section>
        );
    }

    return (
        <section className="relative aspect-21/9 w-full overflow-hidden group bg-muted/20">
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
                        className="object-cover transition-transform duration-3000 group-hover:scale-105"
                        src={bannerItems[currentIndex]?.src || ""}
                        alt={bannerItems[currentIndex]?.title || "Banner"}
                        priority
                    />
                    <div className="relative z-20 text-center text-white px-6 max-w-5xl">
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 1 }}
                        >
                            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 md:mb-10 uppercase leading-[0.85] [text-shadow:0_4px_24px_rgba(0,0,0,0.8)]">
                                {bannerItems[currentIndex]?.title}
                            </h1>
                            <p className="text-base md:text-lg text-white font-medium leading-relaxed tracking-wide max-w-xl mx-auto py-2 drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
                                {bannerItems[currentIndex]?.description}
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 flex items-center justify-between px-4 md:px-16 z-30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-700">
                <button
                    onClick={prevSlide}
                    className="p-2 md:p-4 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-500"
                >
                    <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
                </button>
                <button
                    onClick={nextSlide}
                    className="p-2 md:p-4 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-500"
                >
                    <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
                </button>
            </div>

            <div className="absolute bottom-10 md:bottom-16 left-1/2 -translate-x-1/2 md:left-24 md:translate-x-0 flex items-center gap-4 z-35">
                {bannerItems.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-px transition-all duration-1000 rounded-full ${i === currentIndex ? "w-16 md:w-32 bg-brand" : "w-2 md:w-4 bg-white/20 hover:bg-white/40"}`}
                    />
                ))}
            </div>
        </section>
    );
}
