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
        const breakpoints = {
            wide: "(min-width: 1536px)",
            desktop: "(min-width: 1280px)",
            tabletLarge: "(min-width: 1024px)",
            tablet: "(min-width: 640px)",
            mobile: "(max-width: 639px)",
        };

        const updateColumns = () => {
            if (window.matchMedia(breakpoints.wide).matches) setColumnCount(columnSettings.wide);
            else if (window.matchMedia(breakpoints.desktop).matches) setColumnCount(columnSettings.desktop);
            else if (window.matchMedia(breakpoints.tabletLarge).matches) setColumnCount(Math.max(columnSettings.tablet, 2));
            else if (window.matchMedia(breakpoints.tablet).matches) setColumnCount(columnSettings.tablet);
            else setColumnCount(columnSettings.mobile);
        };

        updateColumns();

        // Use media query listeners for much better performance than 'resize' event
        const queries = Object.values(breakpoints).map(q => window.matchMedia(q));
        queries.forEach(mql => {
            if (mql.addEventListener) mql.addEventListener("change", updateColumns);
            else mql.addListener(updateColumns); // Legacy
        });

        return () => {
            queries.forEach(mql => {
                if (mql.removeEventListener) mql.removeEventListener("change", updateColumns);
                else mql.removeListener(updateColumns);
            });
        };
    }, [columnSettings]);

    // Distribute images into columns (Shortest column first with Left-Priority bias)
    const groupedColumns = useMemo(() => {
        const cols = Array.from(
            { length: columnCount },
            () => [] as (GalleryImage & { globalIdx: number })[],
        );
        const heights = new Array(columnCount).fill(0);

        displayImages.forEach((img, idx) => {
            // Find the best column: shortest one, with a slight bias towards the left (smaller index)
            let targetIndex = 0;
            let minHeight = heights[0];

            // A tiny threshold (epsilon) to give preference to leftmost columns
            // when the height difference is negligible.
            const threshold = 0.02; 

            for (let i = 1; i < columnCount; i++) {
                // If this column is significantly shorter than our current choice, switch to it
                if (heights[i] < minHeight - threshold) {
                    minHeight = heights[i];
                    targetIndex = i;
                }
                // If it's about the same or taller, we stick with the smaller index (leftmost)
            }

            cols[targetIndex].push({ ...img, globalIdx: idx });

            // Update column height based on aspect ratio
            const aspectRatio = img.aspect_ratio || 1;
            heights[targetIndex] += 1 / aspectRatio;
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
