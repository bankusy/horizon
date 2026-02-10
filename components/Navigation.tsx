"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const pathname = usePathname();

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
            className={`fixed top-0 left-0 w-full z-100 transition-all duration-700 flex items-center ${
                isScrolled
                    ? "bg-background/80 backdrop-blur-xl border-b border-border/50 h-16 md:h-20"
                    : "bg-transparent h-24 md:h-32"
            }`}
        >
            <div className="w-full px-6 md:px-12 lg:px-20 mx-auto flex items-center justify-between">
                {/* Brand */}
                <Link
                    href="/"
                    className="text-xl md:text-3xl font-light tracking-tighter text-foreground transition-base hover:opacity-70 flex items-center gap-1.5"
                >
                    <div className="relative w-8 h-8 md:w-10 md:h-10">
                        <Image 
                            src="/logo.svg" 
                            alt="HORIZON Logo" 
                            fill 
                            className="object-contain"
                        />
                    </div>
                    <span>HORIZON</span>
                </Link>

                {/* Simplified Navigation */}
                <div className="flex items-center">
                    <Link
                        href="/contact"
                        className={`text-lg md:text-xl font-bold transition-base px-6 py-2 ${
                            pathname === "/contact" 
                                ? "text-brand" 
                                : "text-muted-foreground hover:text-brand"
                        }`}
                    >
                        Contact
                    </Link>
                </div>
            </div>

            {/* Progress Bar at the absolute bottom */}
            <div className={`absolute bottom-0 left-0 h-[2px] w-full bg-border/10 transition-opacity duration-500 hidden md:block ${isScrolled ? "opacity-100" : "opacity-0"}`}>
                <motion.div
                    className="h-full bg-foreground"
                    style={{ width: `${scrollProgress}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            </div>
        </nav>
    );
}
