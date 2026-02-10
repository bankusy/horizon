import { useEffect, useState, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Category, GalleryImage } from "@/types/gallery";

// Helper to extract YouTube ID
export const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
};

// Real Supabase Data Fetching
const fetchGalleryPage = async ({
    pageParam = 0,
    categoryId = "All",
    categoriesMap = {} as Record<string, string>,
    allowedCategoryIds = null as string[] | null,
    itemsPerPage = 50,
}): Promise<{ images: GalleryImage[]; nextCursor: number | null; totalCount: number }> => {
    if (!supabase) return { images: [], nextCursor: null, totalCount: 0 };

    const from = pageParam * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let query = supabase
        .from("gallery")
        .select("*", { count: "exact" })
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false })
        .range(from, to);

    if (categoryId !== "All") {
        query = query.eq("category_id", categoryId);
    } else if (allowedCategoryIds && allowedCategoryIds.length > 0) {
        query = query.in("category_id", allowedCategoryIds);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error("Supabase fetch error:", error);
        throw error;
    }

    const images =
        data?.map((item: any) => {
            return {
                id: item.id,
                src: item.src,
                alt: item.title,
                category_id: item.category_id,
                category_name:
                    categoriesMap[item.category_id] || "Uncategorized",
                type: item.type,
                video_url: item.video_url,
                width: item.width,
                height: item.height,
                aspect_ratio: item.aspect_ratio,
                display_order: item.display_order,
            };
        }) || [];

    const hasNext = count ? from + itemsPerPage < count : false;

    return {
        images,
        nextCursor: hasNext ? pageParam + 1 : null,
        totalCount: count || 0,
    };
};

// Seeded random number generator (mulberry32)
function seededRandom(seed: number) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function seededShuffle<T>(array: T[], seed: number): T[] {
    const result = [...array];
    const rng = seededRandom(seed);
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

export function useGalleryData(initialImages: GalleryImage[], nextCursor: number | null, itemsPerPage: number = 50, isShuffled: boolean = false) {
    const [selectedCategoryId, setSelectedCategoryId] = useState("All");
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesMap, setCategoriesMap] = useState<Record<string, string>>(
        {},
    );
    const [allowedCategoryIds, setAllowedCategoryIds] = useState<string[] | null>(null);
    const [totalCount, setTotalCount] = useState(0);

    // 카테고리 목록 로드
    useEffect(() => {
        async function fetchCategories() {
            if (!supabase) return;
            const { data } = await supabase
                .from("categories")
                .select("id, name, show_in_all")
                .order("display_order", { ascending: true });
            if (data) {
                setCategories(data);
                const map: Record<string, string> = {};
                const allowedIds: string[] = [];
                data.forEach((c: any) => {
                    map[c.id] = c.name;
                    console.log(c.show_in_all);
                    
                    if (c.show_in_all !== false) {
                        allowedIds.push(c.id);
                    }
                });
                setCategoriesMap(map);
                setAllowedCategoryIds(allowedIds);
            }
        }
        fetchCategories();
    }, []);

    // React Query for professional caching & state management
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
        useInfiniteQuery({
            queryKey: ["gallery", selectedCategoryId, categoriesMap, allowedCategoryIds, itemsPerPage],
            queryFn: ({ pageParam }) =>
                fetchGalleryPage({
                    pageParam,
                    categoryId: selectedCategoryId,
                    categoriesMap,
                    allowedCategoryIds,
                    itemsPerPage,
                }),
            initialPageParam: 0,
            getNextPageParam: (lastPage) => lastPage.nextCursor,
            staleTime: 1000 * 60 * 10, // Cache for 10 minutes
            initialData:
                selectedCategoryId === "All" &&
                Object.keys(categoriesMap).length === 0
                    ? {
                          pages: [{ images: initialImages, nextCursor, totalCount: initialImages.length }], // approx for initial
                          pageParams: [0],
                      }
                    : undefined,
        });

    useEffect(() => {
        // Use the totalCount from the latest fetched page to get the true DB count
        const lastPage = data?.pages[data.pages.length - 1];
        if (lastPage?.totalCount) {
            setTotalCount(lastPage.totalCount);
        }
    }, [data]);

    // Shuffle seed — changes on every page load for a fresh order
    const shuffleSeed = useRef<number>(Date.now());

    const displayImages = useMemo(() => {
        const images = data?.pages.flatMap((page) => page.images) ?? [];
        if (isShuffled && images.length > 0) {
            const seed = typeof shuffleSeed.current === 'function' 
                ? (shuffleSeed.current as () => number)()
                : shuffleSeed.current;
            shuffleSeed.current = seed;
            return seededShuffle(images, seed);
        }
        return images;
    }, [data, isShuffled]);

    return {
        selectedCategoryId,
        setSelectedCategoryId,
        categories,
        categoriesMap,
        displayImages,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        totalCount,
    };
}
