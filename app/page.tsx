import { supabase } from "@/lib/supabase";
import { Navigation } from "@/components/Navigation";
import { HeroHeader } from "@/components/HeroHeader";
import { BannerCarousel } from "@/components/BannerCarousel";
import { GalleryView } from "@/components/GalleryView";

// 서버 사이드 데이터 페칭 함수
async function getInitialData() {
    if (!supabase) return { banners: [], initialImages: [], nextCursor: null };

    // 1. 배너 데이터 페칭
    const { data: bannerData } = await supabase
        .from("banners")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

    // 2. 초기 갤러리 이미지 데이터 페칭 (첫 50개)
    const itemsPerPage = 50;
    const { data: imageData, count } = await supabase
        .from("gallery")
        .select("*", { count: "exact" })
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false })
        .range(0, itemsPerPage - 1);

    const initialImages = imageData?.map((item: any) => ({
        id: item.id,
        src: item.src,
        alt: item.title,
        category: item.category,
        video_url: item.video_url,
        aspect_ratio: item.aspect_ratio || 1,
    })) || [];

    const hasNext = count ? itemsPerPage < count : false;

    return {
        banners: bannerData || [],
        initialImages,
        nextCursor: hasNext ? 1 : null,
    };
}

export default async function Home() {
    const { banners, initialImages, nextCursor } = await getInitialData();

    return (
        <div className="min-h-screen bg-background font-sans selection:bg-background selection:text-foreground overflow-x-hidden">
            <Navigation />

            <main className="pt-(--navbar-height)">
                <HeroHeader />

                <BannerCarousel initialBanners={banners} />

                <GalleryView 
                    initialImages={initialImages} 
                    nextCursor={nextCursor} 
                />
            </main>
        </div>
    );
}

// ISR 설정: 1시간마다 데이터 갱신 (선택 사항)
export const revalidate = 3600;
