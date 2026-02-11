import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next"
import MobileActionBar from "@/components/MobileActionBar";
import { supabase } from "@/lib/supabase";

const instrumentSans = localFont({
  src: "../public/fonts/InstrumentSans-VariableFont.ttf",
  variable: "--font-instrumentSans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "투시도 건축 CG 전문 호리즌",
  description: "Premium high-end architectural visualization and interior design studio.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch Background Color Settings
  let bgLight = "#ffffff";
  let bgDark = "#09090b";

  if (supabase) {
    const { data: lightData } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "gallery_bg_light")
      .single();
    
    if (lightData?.value) bgLight = String(lightData.value);

    const { data: darkData } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "gallery_bg_dark")
      .single();
    
    if (darkData?.value) bgDark = String(darkData.value);
  }

  return (
    <html lang="ko" className={instrumentSans.variable} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --background: ${bgLight};
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --background: ${bgDark};
            }
          }
          body {
            background-color: var(--background);
          }
        `}} />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground relative">
        <Analytics/>
        <Providers>
          {children}
          <Toaster position="top-center" richColors />
          <MobileActionBar />
        </Providers>
      </body>
    </html>
  );
}

