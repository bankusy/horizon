"use client";

import dynamic from "next/dynamic";
import React from "react";

const DynamicGalleryView = dynamic(
  () => import("@/components/GalleryView").then((mod) => mod.GalleryView),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[400px] flex items-center justify-center text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
        Loading Gallery...
      </div>
    ),
  }
);

export default DynamicGalleryView;
