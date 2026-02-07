"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
            
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
            setScrollProgress(progress);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`h-(--navbar-height) fixed top-0 left-0 w-full z-100 transition-all duration-500  ${
                isScrolled
                    ? "bg-background/80 backdrop-blur-xl border-b border-border/50 py-3 md:py-4"
                    : "bg-background/0 py-6 md:py-8"
            }`}
        >
            <div className="w-full px-6 md:px-12 lg:px-20 mx-auto flex items-center justify-between">
                {/* Brand */}
                <Link
                    href="/"
                    className="text-xl md:text-2xl font-black tracking-tighter text-foreground transition-base hover:opacity-70 flex items-center gap-2"
                >
                    HORIZON
                </Link>

                {/* Simplified Navigation */}
                <div className="flex items-center">
                    <Link
                        href="/contact"
                        className="text-[10px] md:text-sm font-bold uppercase tracking-[0.4em] text-muted-foreground transition-base  px-6 py-2 hover:text-background"
                    >
                        Contact
                    </Link>
                </div>
            </div>

            {/* Progress Bar at the absolute bottom */}
            <div className={`absolute bottom-0 left-0 h-[1.5px] w-full bg-border/10 transition-opacity duration-500 ${isScrolled ? "opacity-100" : "opacity-0"}`}>
                <motion.div
                    className="h-full bg-foreground"
                    style={{ width: `${scrollProgress}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            </div>
        </nav>
    );
}
