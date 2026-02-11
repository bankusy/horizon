"use client";

import React from "react";
import Image from "next/image";

interface FooterSectionProps {
  title?: string;
  children: React.ReactNode;
}

function FooterSection({ title, children }: FooterSectionProps) {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {title && (
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground transition-colors duration-500">
          {title}
        </h3>
      )}
      <div className="flex flex-col gap-4 transition-colors duration-500">
        {children}
      </div>
    </div>
  );
}

interface FooterRowProps {
  label: string;
  value: React.ReactNode;
  isLink?: boolean;
  href?: string;
}

function FooterRow({ label, value, isLink, href }: FooterRowProps) {
  const content = (
    <div className="grid grid-cols-[100px_1fr] md:grid-cols-[120px_1fr] items-baseline gap-4 group cursor-default">
      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 transition-colors duration-500 group-hover:text-muted-foreground/60">
        {label}
      </span>
      <span className={`text-sm font-medium tracking-tight transition-colors duration-500 whitespace-nowrap ${isLink ? 'text-muted-foreground/80 hover:text-foreground' : 'text-muted-foreground/90'}`}>
        {value}
      </span>
    </div>
  );

  if (isLink && href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
}

export function Footer() {
  return (
    <footer className="w-full bg-background border-t border-border/50 py-16 md:py-24 pb-28 md:pb-24">
      <div className="w-full px-6 md:px-12 lg:px-20 mx-auto max-w-[1920px]">
        {/* Main Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-24 lg:gap-32 items-start">
          
          {/* Section 1: Brand */}
          <div className="flex flex-col gap-6 md:gap-8">
            <div className="flex items-center gap-1.5 hover:opacity-70 transition-base cursor-pointer">
              <div className="relative w-8 h-8 md:w-10 md:h-10">
                <Image
                  src="/logo.svg"
                  alt="HORIZON Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <h2 className="text-3xl font-light tracking-tighter uppercase leading-none">
                HORIZON
              </h2>
            </div>
            <p className="text-sm text-muted-foreground/70 max-w-sm leading-relaxed font-light transition-colors duration-500">
              Premium high-end architectural visualization studio capturing the essence of space through visual excellence.
            </p>
          </div>

          {/* Section 2: Contact */}
          <FooterSection title="Contact">
            <div className="flex flex-col gap-3">
              <FooterRow label="Representative" value="Jeong Won Sik" />
              <FooterRow label="Phone" value="010-3500-7742" isLink href="tel:+821035007742" />
              <FooterRow label="Email" value="cghrn@naver.com" isLink href="mailto:cghrn@naver.com" />
            </div>
          </FooterSection>

          {/* Section 3: Business */}
          <FooterSection title="Business">
            <div className="flex flex-col gap-3">
              <FooterRow label="Country" value="Republic of Korea" />
              <FooterRow label="License" value="000-00-00000" />
            </div>
          </FooterSection>
        </div>

        {/* Bottom Bar */}
        <div className="mt-24 pt-12 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-8 text-muted-foreground/40">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase flex flex-col md:flex-row gap-4 md:gap-8 items-center text-center whitespace-nowrap">
            <span>© {new Date().getFullYear()} HORIZON STUDIO</span>
            <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-border" />
            <span>All Rights Reserved</span>
          </div>
          <div className="flex gap-12 whitespace-nowrap">
            <a href="#" className="text-[10px] font-bold tracking-widest uppercase hover:text-foreground transition-all duration-500">Privacy</a>
            <a href="#" className="text-[10px] font-bold tracking-widest uppercase hover:text-foreground transition-all duration-500">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
