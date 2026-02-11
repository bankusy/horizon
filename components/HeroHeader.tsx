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
    };
}

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
            <div className="flex flex-col items-center justify-center relative gap-10 md:gap-14">
                <div className="flex flex-col items-center justify-center">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 0.4, y: 0 }}
                        transition={{ delay: 200, duration: 1 }}
                        className="font-bold tracking-[0.6em] md:tracking-[1em] uppercase mb-4 md:mb-8 text-center"
                        style={{ 
                            color: settings?.hero_subheader_color || "inherit",
                            fontSize: settings?.hero_subheader_size || "clamp(9px, 0.8vw, 11px)"
                        }}
                    >
                        {subheader}
                    </motion.span>
                    <div className="flex items-center justify-center gap-6 md:gap-12">
                        <div className="w-1 h-1 bg-brand/40 rotate-45 hidden md:block shrink-0" />
                        <BlurText
                            text={heading}
                            delay={400}
                            animateBy="words"
                            direction="top"
                            className="font-light tracking-tighter leading-[0.9] text-center"
                            style={{ 
                                color: settings?.hero_heading_color || "inherit",
                                fontSize: settings?.hero_heading_size || "clamp(32px, 6vw, 4.5rem)"
                            }}
                        />
                        <div className="w-1 h-1 bg-brand/40 rotate-45 hidden md:block shrink-0" />
                    </div>
                </div>
                <p 
                    className="tracking-[0.4em] md:tracking-[0.6em] lg:tracking-[0.8em] uppercase font-medium leading-none text-center opacity-40"
                    style={{ 
                        color: settings?.hero_description_color || "inherit",
                        fontSize: settings?.hero_description_size || "clamp(10px, 0.9vw, 13px)"
                    }}
                >
                    {description}
                </p>
            </div>
        </div>
    );
}
