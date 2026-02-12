"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Portal } from "@/components/ui/portal";
import { supabase } from "@/lib/supabase";
import { Logo } from "@/components/Logo";

export function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const pathname = usePathname();

    useEffect(() => {
        async function fetchCategories() {
            if (!supabase) return;
            const { data } = await supabase
                .from("categories")
                .select("id, name")
                .order("display_order", { ascending: true });
            if (data) setCategories(data);
        }
        fetchCategories();
    }, []);

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

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMenuOpen]);

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-2000 transition-all duration-700 flex items-center ${
                isScrolled
                    ? "bg-background/40 backdrop-blur-xl border-b border-border/50 h-16 md:h-20"
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
                        <Logo className="w-full h-full" />
                    </div>
                    <span>HORIZON</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <Link
                        href="/"
                        className={`text-lg md:text-xl font-bold transition-base px-6 py-2 ${
                            pathname === "/" 
                                ? "text-brand" 
                                : "text-muted-foreground hover:text-brand"
                        }`}
                    >
                        Archive
                    </Link>
                    <Link
                        href="/vr"
                        className={`text-lg md:text-xl font-bold transition-base px-6 py-2 ${
                            pathname === "/vr" 
                                ? "text-brand" 
                                : "text-muted-foreground hover:text-brand"
                        }`}
                    >
                        VR
                    </Link>
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

                {/* Mobile Menu Button - Increased z-index */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden p-2 text-foreground focus:outline-none z-2001"
                    aria-label="Toggle Menu"
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu Backdrop & Drawer - Using Portal to be truly on top */}
            <AnimatePresence>
                {isMenuOpen && (
                    <Portal>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 z-3499 bg-black/60 backdrop-blur-sm md:hidden"
                        />

                        {/* Side Drawer Panel */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm z-3500 bg-background border-l border-border flex flex-col p-12 md:hidden"
                        >
                            <div className="flex justify-end mb-12">
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 text-foreground/50 hover:text-foreground transition-colors"
                                >
                                    <X size={32} strokeWidth={1} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-8">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <Link
                                        href="/"
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`text-4xl font-black tracking-tighter uppercase ${
                                            pathname === "/" ? "text-brand" : "text-foreground"
                                        }`}
                                    >
                                        Archive
                                    </Link>
                                    
                                    {/* Category List under Archive for Mobile */}
                                    <div className="flex flex-col gap-3 mt-6 ml-1 border-l border-border pl-6">
                                        {categories.map((cat, idx) => (
                                            <Link
                                                key={cat.id}
                                                href={`/?category=${cat.id}`}
                                                onClick={() => setIsMenuOpen(false)}
                                                className="text-lg font-bold tracking-tight text-muted-foreground hover:text-brand transition-colors uppercase"
                                            >
                                                {cat.name}
                                            </Link>
                                        ))}
                                    </div>
                                </motion.div>
                                
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    <Link
                                        href="/vr"
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`text-4xl font-black tracking-tighter uppercase ${
                                            pathname === "/vr" ? "text-brand" : "text-foreground"
                                        }`}
                                    >
                                        VR
                                    </Link>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Link
                                        href="/contact"
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`text-4xl font-black tracking-tighter uppercase ${
                                            pathname === "/contact" ? "text-brand" : "text-foreground"
                                        }`}
                                    >
                                        Contact
                                    </Link>
                                </motion.div>
                            </div>

                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="mt-auto text-[10px] font-bold tracking-[0.3em] text-muted-foreground uppercase"
                            >
                               Horizon Studio © {new Date().getFullYear()}
                            </motion.div>
                        </motion.div>
                    </Portal>
                )}
            </AnimatePresence>

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
