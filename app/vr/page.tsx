"use client";

import React, { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { motion } from "framer-motion";
import { Loader2, ArrowUpRight } from "lucide-react";

export default function VRArchivePage() {
    const [vrItems, setVrItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [vrColumns, setVrColumns] = useState({
        mobile: 1,
        tablet: 2,
        desktop: 3,
        wide: 3
    });

    useEffect(() => {
        const fetchVRData = async () => {
            if (!supabase) return;
            try {
                // Fetch Settings
                const { data: settingsData } = await supabase
                    .from("site_settings")
                    .select("value")
                    .eq("key", "vr_columns")
                    .single();
                
                if (settingsData?.value) {
                    setVrColumns(settingsData.value as any);
                }

                // Fetch VR Items
                const { data, error } = await supabase
                    .from("vr_contents")
                    .select("*")
                    .order("display_order", { ascending: true })
                    .order("created_at", { ascending: false });

                if (error) throw error;
                setVrItems(data || []);
            } catch (error) {
                console.error("VR public fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVRData();
    }, []);

    return (
        <div className="min-h-screen bg-background font-sans selection:bg-brand selection:text-white overflow-x-hidden">
            <Navigation />

            <main className="pt-(--navbar-height) pb-32">
                {/* Hero Header Section */}
                <div className="px-6 md:px-12 lg:px-20 py-24 md:py-32 flex flex-col items-center text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-4"
                    >
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
                            VR Archive
                        </h1>
                        <p className="text-[10px] md:text-xs font-bold tracking-[0.4em] text-muted-foreground uppercase">
                            Experience the space in virtual reality
                        </p>
                    </motion.div>
                </div>

                {/* Grid Section */}
                <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20">
                    {isLoading ? (
                        <div className="py-40 flex flex-col items-center justify-center">
                            <Loader2 className="h-10 w-10 animate-spin text-brand/20 mb-6" />
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Loading Virtual World</p>
                        </div>
                    ) : vrItems.length > 0 ? (
                        <div 
                            className="grid gap-8 md:gap-12"
                            style={{
                                gridTemplateColumns: `repeat(var(--grid-cols, ${vrColumns.mobile}), minmax(0, 1fr))`
                            } as any}
                        >
                            {/* Breakpoint Styles */}
                            <style jsx global>{`
                                :root {
                                    --grid-cols: ${vrColumns.mobile};
                                }
                                @media (min-width: 768px) {
                                    :root { --grid-cols: ${vrColumns.tablet}; }
                                }
                                @media (min-width: 1024px) {
                                    :root { --grid-cols: ${vrColumns.desktop}; }
                                }
                                @media (min-width: 1280px) {
                                    :root { --grid-cols: ${vrColumns.wide}; }
                                }
                            `}</style>
                                {vrItems.map((item, index) => (
                                    <motion.a
                                        key={item.id}
                                        href={item.link_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        initial={{ opacity: 0, y: 40 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ 
                                            duration: 0.8, 
                                            delay: index * 0.1,
                                            ease: [0.22, 1, 0.36, 1] 
                                        }}
                                        className="group relative flex flex-col gap-6"
                                    >
                                        <div className="relative aspect-video overflow-hidden bg-muted">
                                            <Image
                                                src={item.thumbnail_url}
                                                alt={item.title}
                                                fill
                                                className="object-cover transition-transform duration-1000 scale-100 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-black transform scale-75 group-hover:scale-100 transition-transform duration-500">
                                                    <ArrowUpRight size={32} />
                                                </div>
                                            </div>
                                            <div className="absolute top-6 right-6">
                                                <div className="px-4 py-1.5 bg-black/60 backdrop-blur-xl border border-white/10">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-white">
                                                        VIEW 360°
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black tracking-tighter uppercase leading-tight group-hover:text-brand transition-colors">
                                                {item.title}
                                            </h3>
                                            {item.description && (
                                                <p className="text-xs text-muted-foreground uppercase tracking-widest leading-relaxed">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                    </motion.a>
                                ))}
                        </div>
                    ) : (
                        <div className="py-40 flex flex-col items-center justify-center border border-dashed border-border/50">
                            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">Archive is currently empty</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
