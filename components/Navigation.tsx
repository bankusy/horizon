import React from "react";
import ShinyText from './ShinyText';

export default function Navigation() {
    return (
        <nav className="w-full px-6 md:px-12 py-8 bg-background">
            <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="flex flex-col">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-4">
                        
                        HORIZON
                        </h1>
                    <div className="flex flex-col gap-1 text-sm font-light tracking-wide text-muted-foreground uppercase">
                        <p className="font-medium text-foreground">Architectural Visualization Studio</p>
                        <p>Visual Studio Group</p>
                    </div>
                </div>

                <div className="flex flex-col md:text-right gap-1 text-sm font-light text-muted-foreground uppercase tracking-widest">
                    <p className="font-semibold text-foreground tracking-normal">DIRECTOR : JEONG WON SIK</p>
                    <div className="flex flex-col md:items-end gap-0.5 opacity-80">
                        <p>Mobile : +82 10 - 3500 - 7742</p>
                        <p>E-mail : cghrn@naver.com</p>
                    </div>
                </div>
            </div>
        </nav>
    );
}
