import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next"
import KakaoButton from "@/components/KakaoButton";

const instrumentSans = localFont({
  src: "../public/fonts/InstrumentSans-VariableFont.ttf",
  variable: "--font-instrumentSans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "투시도 건축 CG 전문 호리즌",
  description: "Premium high-end architectural visualization and interior design studio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={instrumentSans.variable} suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground relative">
        <Analytics/>
        <Providers>
          {children}
          <Toaster position="top-center" richColors />
          <KakaoButton />
        </Providers>
      </body>
    </html>
  );
}

