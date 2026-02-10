"use client";

import Image from "next/image";
import BlurText from "@/components/BlurText";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function HeroHeader() {
    const [assetsLoaded, setAssetsLoaded] = useState(false);

    useEffect(() => {
        setAssetsLoaded(true);
    }, []);

    return (
        <div className="block w-full px-4 min-[400px]:px-8 md:px-12 lg:px-20 mx-auto border-b border-border/50 pb-12 pt-12 md:pb-20 md:py-32">
            <div className="flex flex-col items-center justify-center relative gap-8 md:gap-12">
                <div className="flex flex-col items-center justify-center">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 0.4, y: 0 }}
                        transition={{ delay: 200, duration: 1 }}
                        className="text-[8px] md:text-sm font-bold tracking-[0.8em] md:tracking-[1.5em] uppercase mb-3 md:mb-6 text-center"
                    >
                        CAPTURING ALL THE ESSENCE
                    </motion.span>
                    <div className="flex items-center justify-center gap-6 md:gap-10">
                        <div className="w-1 h-1 bg-brand rotate-45 hidden md:block" />
                        <BlurText
                            text="WE VISUALIZE THE UNBUILT"
                            delay={400}
                            animateBy="words"
                            direction="top"
                            className="text-2xl sm:text-3xl md:text-5xl lg:text-[6rem] font-light tracking-tighter leading-none text-center"
                        />
                        <div className="w-1 h-1 bg-brand rotate-45 hidden md:block" />
                    </div>
                </div>
                <p className="text-[8px] sm:text-xs md:text-sm lg:text-base tracking-[0.3em] md:tracking-[0.8em] lg:tracking-[1.2em] text-muted-foreground/60 uppercase font-medium leading-none whitespace-normal text-center">
                    ARCHITECTURAL VISUALIZATION STUDIO
                </p>
            </div>
        </div>
    );
}
