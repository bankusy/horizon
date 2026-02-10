import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { GalleryImage } from "@/types/gallery";

export function useGallerySettings(displayImages: GalleryImage[]) {
    // Column count based on screen size and site settings
    const [columnCount, setColumnCount] = useState(1);
    const [columnSettings, setColumnSettings] = useState({
        mobile: 1,
        tablet: 2,
        desktop: 4,
        wide: 5,
    });
    const [imageRadius, setImageRadius] = useState(0);
    const [isShuffled, setIsShuffled] = useState(false);

    // 그리드 설정 로드
    useEffect(() => {
        async function loadColumnSettings() {
            if (!supabase) return;
            try {
                const { data } = await supabase
                    .from("site_settings")
                    .select("value")
                    .eq("key", "gallery_columns")
                    .single();

                const { data: radiusData } = await supabase
                    .from("site_settings")
                    .select("value")
                    .eq("key", "gallery_image_radius")
                    .single();

                if (data?.value) {
                    setColumnSettings(data.value);
                }

                if (radiusData?.value) {
                    setImageRadius(Number(radiusData.value) || 0);
                }

                const { data: shuffleData } = await supabase
                    .from("site_settings")
                    .select("value")
                    .eq("key", "gallery_shuffle")
                    .single();

                if (shuffleData?.value !== undefined) {
                    setIsShuffled(Boolean(shuffleData.value));
                }
            } catch (e) {
                console.error("Settings load failed:", e);
            }
        }
        loadColumnSettings();
    }, []);

    useEffect(() => {
        const updateColumns = () => {
            const width = window.innerWidth;
            if (width >= 1536) setColumnCount(columnSettings.wide);
            else if (width >= 1280) setColumnCount(columnSettings.desktop);
            else if (width >= 1024)
                setColumnCount(Math.max(columnSettings.tablet, 2));
            else if (width >= 640) setColumnCount(columnSettings.tablet);
            else setColumnCount(columnSettings.mobile);
        };
        updateColumns();
        window.addEventListener("resize", updateColumns);
        return () => window.removeEventListener("resize", updateColumns);
    }, [columnSettings]);

    // Distribute images into columns (Shortest column first logic)
    const groupedColumns = useMemo(() => {
        const cols = Array.from(
            { length: columnCount },
            () => [] as (GalleryImage & { globalIdx: number })[],
        );
        const heights = new Array(columnCount).fill(0);

        displayImages.forEach((img, idx) => {
            // Find the shortest column
            let minHeight = heights[0];
            let columnIndex = 0;

            for (let i = 1; i < columnCount; i++) {
                if (heights[i] < minHeight) {
                    minHeight = heights[i];
                    columnIndex = i;
                }
            }

            cols[columnIndex].push({ ...img, globalIdx: idx });

            // Add aspect ratio height (1/aspect_ratio) to column height
            // Default aspect ratio to 1 if missing for calculation
            const aspectRatio = img.aspect_ratio || 1;
            heights[columnIndex] += 1 / aspectRatio;
        });

        return cols;
    }, [displayImages, columnCount]);

    return {
        columnCount,
        imageRadius,
        isShuffled,
        groupedColumns
    };
}
