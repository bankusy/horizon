"use client";

import Image from "next/image";
import BlurText from "@/components/BlurText";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface HeroHeaderProps {
    settings?: {
        hero_heading?: string;
        hero_subheader?: string;
        hero_description?: string;
        hero_heading_color?: string;
        hero_subheader_color?: string;
        hero_description_color?: string;
        hero_heading_size?: string;
        hero_subheader_size?: string;
        hero_description_size?: string;
        hero_heading_size_mobile?: string;
        hero_subheader_size_mobile?: string;
        hero_description_size_mobile?: string;
    };
}

const formatSize = (size: string | number | undefined, fallback: string) => {
    if (!size || size === "") return fallback;
    if (/^\d+(\.\d+)?$/.test(String(size))) return `${size}px`;
    return String(size);
};

const getFluidSize = (
    mobile: string | number | undefined, 
    desktop: string | number | undefined, 
    defMobile: string, 
    defDesktop: string, 
    vwScale: string
) => {
    const m = formatSize(mobile, defMobile);
    const d = formatSize(desktop, defDesktop);
    return `clamp(${m}, ${vwScale}, ${d})`;
};

export function HeroHeader({ settings }: HeroHeaderProps) {
    const [assetsLoaded, setAssetsLoaded] = useState(false);

    useEffect(() => {
        setAssetsLoaded(true);
    }, []);

    const heading = settings?.hero_heading || "WE VISUALIZE THE UNBUILT";
    const subheader = settings?.hero_subheader || "CAPTURING ALL THE ESSENCE";
    const description = settings?.hero_description || "ARCHITECTURAL VISUALIZATION STUDIO";

    return (
        <div className="block w-full px-4 min-[400px]:px-8 md:px-12 lg:px-20 mx-auto border-b border-border/50 pb-12 pt-16 md:pb-20 md:py-32">
            <div className="flex flex-col items-center justify-center relative gap-8 md:gap-12">
                <div className="flex flex-col items-center justify-center">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 0.4, y: 0 }}
                        transition={{ delay: 200, duration: 1 }}
                        className="font-bold tracking-[0.4em] min-[400px]:tracking-[0.6em] md:tracking-[1em] uppercase mb-3 md:mb-6 text-center whitespace-nowrap"
                        style={{ 
                            color: settings?.hero_subheader_color || "inherit",
                            fontSize: getFluidSize(
                                settings?.hero_subheader_size_mobile, 
                                settings?.hero_subheader_size, 
                                "10px", 
                                "14px", 
                                "1.5vw"
                            )
                        }}
                    >
                        {subheader}
                    </motion.span>
                    <div className="flex items-center justify-center gap-4 md:gap-12 w-full">
                        <div className="w-1 h-1 bg-brand/30 rotate-45 hidden md:block shrink-0" />
                        <BlurText
                            text={heading}
                            delay={400}
                            animateBy="words"
                            direction="top"
                            className="font-light tracking-tighter leading-[0.9] text-center whitespace-nowrap"
                            style={{ 
                                color: settings?.hero_heading_color || "inherit",
                                fontSize: getFluidSize(
                                    settings?.hero_heading_size_mobile, 
                                    settings?.hero_heading_size, 
                                    "32px", 
                                    "7rem", 
                                    "6vw"
                                )
                            }}
                        />
                        <div className="w-1 h-1 bg-brand/30 rotate-45 hidden md:block shrink-0" />
                    </div>
                </div>
                <p 
                    className="tracking-[0.3em] min-[400px]:tracking-[0.5em] md:tracking-[0.8em] lg:tracking-[1em] uppercase font-medium leading-none text-center opacity-40 shrink-0 whitespace-nowrap"
                    style={{ 
                        color: settings?.hero_description_color || "inherit",
                        fontSize: getFluidSize(
                            settings?.hero_description_size_mobile, 
                            settings?.hero_description_size, 
                            "11px", 
                            "16px", 
                            "1.2vw"
                        )
                    }}
                >
                    {description}
                </p>
            </div>
        </div>
    );
}
