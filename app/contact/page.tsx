"use client";

import { Navigation } from "@/components/Navigation";
import BlurText from "@/components/BlurText";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";

export default function ContactPage() {
    const contactInfo = [
        {
            label: "Chief Executive Officer",
            value: "Jeong Won Sik",
            link: null,
        },
        {
            label: "Direct Line",
            value: "010-3500-7742",
            link: "tel:+821035007742",
        },
        {
            label: "Email Address",
            value: "cghrn@naver.com",
            link: "mailto:cghrn@naver.com",
        },
    ];

    return (
        <div className="min-h-screen bg-background font-sans selection:bg-background selection:text-foreground overflow-x-hidden">
            <Navigation />

            <main className="pt-40 md:pt-64 pb-24">
                <div className="w-full px-6 md:px-12 lg:px-20 mx-auto max-w-[1920px]">
                    <div className="flex flex-col gap-24 md:gap-40">
                        {/* Title Section */}
                        <section className="relative">
                            <span className="text-[10px] md:text-xs font-light tracking-[1em] uppercase opacity-40 mb-8 block">
                                Get in touch
                            </span>
                            <h1 className="text-6xl md:text-9xl font-light tracking-tighter uppercase leading-[0.85] flex flex-col">
                                <BlurText
                                    text="CONNECT"
                                    delay={200}
                                    animateBy="words"
                                    direction="top"
                                    className="text-6xl md:text-9xl font-light text-brand"
                                />
                                <BlurText
                                    text="STREAMS"
                                    delay={400}
                                    animateBy="words"
                                    direction="top"
                                    className="text-6xl md:text-9xl font-light opacity-20"
                                />
                            </h1>
                        </section>

                        {/* Content Section */}
                        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                            <div className="flex flex-col gap-12 max-w-xl">
                                <p className="text-lg md:text-2xl font-light leading-relaxed text-muted-foreground">
                                    We transform architectural concepts into 
                                    <span className="text-foreground font-medium"> hyper-realistic experiences. </span> 
                                    Reach out to discuss your next visionary project.
                                </p>
                                
                                <div className="h-px w-full bg-border/50" />
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase opacity-60">
                                    <p>© 2026 HORIZON STUDIO</p>
                                    <p>ALL RIGHTS RESERVED</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                {contactInfo.map((info, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + idx * 0.1, duration: 0.8 }}
                                        className="group"
                                    >
                                        {info.link ? (
                                            <a 
                                                href={info.link}
                                                className="flex flex-col p-8 md:p-12 bg-muted/20 border border-transparent hover:border-brand/20 transition-all duration-500 hover:bg-brand/5 group/card"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase opacity-40">
                                                        {info.label}
                                                    </span>
                                                    <ArrowUpRight className="w-5 h-5 opacity-0 group-hover/card:opacity-100 group-hover/card:text-brand transition-all duration-500" />
                                                </div>
                                                <span className="text-xl md:text-3xl font-medium tracking-tight group-hover/card:text-brand transition-colors duration-500">
                                                    {info.value}
                                                </span>
                                            </a>
                                        ) : (
                                            <div className="flex flex-col p-8 md:p-12 border border-border/20">
                                                <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase opacity-40 mb-4">
                                                    {info.label}
                                                </span>
                                                <span className="text-xl md:text-3xl font-medium tracking-tight">
                                                    {info.value}
                                                </span>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
