import Image from "next/image";
import { motion } from "framer-motion";
import BlurText from "@/components/BlurText";

export default function Navigation() {
    return (
        <motion.nav 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 md:px-12 lg:px-20 py-20 md:py-20 bg-background border-b border-border/50"
        >
            <div className="w-full px-6 md:px-12 lg:px-20 mx-auto flex flex-col items-center lg:flex-row justify-between lg:items-end gap-14 lg:gap-6 text-center">
                <div className="flex flex-col items-center lg:items-start relative lg:right-1.5">
                    <h1 className="flex items-center justify-center lg:justify-start gap-2 min-[400px]:gap-4 text-5xl min-[400px]:text-6xl sm:text-7xl lg:text-8xl font-medium tracking-tighter leading-none">
                        <div className="flex-shrink-0">
                            <Image
                                width={128}
                                height={128}
                                src={"/logo.svg"}
                                alt="logo"
                                priority
                                className="w-16 min-[400px]:w-20 md:w-32 lg:w-40"
                            />
                        </div>
                        <BlurText
                            text="HORIZON"
                            delay={200}
                            animateBy="words"
                            direction="top"
                            className="text-5xl min-[400px]:text-6xl sm:text-7xl lg:text-8xl font-medium tracking-tighter"
                        />
                        {/* Spacer to perfectly center the title on mobile/tablet */}
                        <div 
                            className="lg:hidden w-16 min-[400px]:w-20 md:w-32 flex-shrink-0 invisible" 
                            aria-hidden="true" 
                        />
                    </h1>
                    <div className="flex flex-col gap-2 text-[10px] sm:text-[11px] md:text-sm font-light tracking-[0.15em] sm:tracking-[0.2em] md:tracking-wide text-muted-foreground uppercase opacity-70">
                        <p className="font-semibold text-foreground tracking-normal">Architectural Visualization Studio</p>
                        <p>Visual Studio Group — Archive</p>
                    </div>
                </div>

                <div className="flex flex-col items-center lg:items-end lg:text-right gap-1.5 text-[9px] sm:text-[10px] md:text-sm font-light text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.3em] lg:tracking-widest">
                    <p className="font-bold text-foreground tracking-normal mb-1">JEONG WON SIK</p>
                    <div className="flex flex-col items-center lg:items-end gap-1 opacity-60">
                        <p>+82 10 - 3500 - 7742</p>
                        <p>cghrn@naver.com</p>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
