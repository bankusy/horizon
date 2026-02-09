"use client";

import Image from "next/image";
import BlurText from "@/components/BlurText";
import { useState, useEffect } from "react";

export function HeroHeader() {
    const [logoLoaded, setLogoLoaded] = useState(false);
    const [assetsLoaded, setAssetsLoaded] = useState(false);

    useEffect(() => {
        if (logoLoaded) {
            const timer = setTimeout(() => setAssetsLoaded(true), 500);
            return () => clearTimeout(timer);
        }
    }, [logoLoaded]);

    return (
        <div className="hidden md:block w-full px-4 min-[400px]:px-6 md:px-12 lg:px-20 mx-auto border-b border-border/50 pb-20 md:py-32">
            <div className="flex flex-col items-center justify-center relative gap-8 md:gap-12">
                <div className="flex items-center justify-center gap-6 md:gap-10">
                    <div className="shrink-0">
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
                            className="w-24 md:w-32 lg:w-48 h-auto"
                        />
                    </div>
                    <BlurText
                        text="HORIZON"
                        delay={400}
                        animateBy="words"
                        direction="top"
                        className="text-5xl md:text-7xl lg:text-[10rem] font-medium tracking-tighter leading-none"
                    />
                </div>
                <p className="text-[10px] sm:text-xs md:text-sm lg:text-base tracking-[0.5em] md:tracking-[0.8em] lg:tracking-[1.2em] text-muted-foreground/60 uppercase font-medium leading-none whitespace-nowrap">
                    ARCHITECTURAL VISUALIZATION STUDIO
                </p>
            </div>
        </div>
    );
}
