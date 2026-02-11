import { supabase } from "@/lib/supabase";
import { Navigation } from "@/components/Navigation";
import { HeroHeader } from "@/components/HeroHeader";
import { BannerCarousel } from "@/components/BannerCarousel";
import { GalleryView } from "@/components/GalleryView";
import { Footer } from "@/components/Footer";

// 서버 사이드 데이터 페칭 함수
async function getInitialData() {
    if (!supabase) return { banners: [], initialImages: [], nextCursor: null };

    // 0. 페이징 설정 조회
    const { data: pagingData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "gallery_items_per_page")
        .single();
    
    const itemsPerPage = Number(pagingData?.value) || 50;

    const { data: initialPagingData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "gallery_initial_items")
        .single();
    
    const initialItemsCount = Number(initialPagingData?.value) || 50;

    // 1. 배너 데이터 페칭
    const { data: bannerData } = await supabase
        .from("banners")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

    // 2. 초기 갤러리 이미지 데이터 페칭 (설정된 개수만큼)
    const { data: imageData, count } = await supabase
        .from("gallery")
        .select("*", { count: "exact" })
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false })
        .range(0, initialItemsCount - 1);

    const initialImages = imageData?.map((item: any) => ({
        id: item.id,
        src: item.src,
        alt: item.title,
        category: item.category,
        category_id: item.category_id,
        video_url: item.video_url,
        aspect_ratio: item.aspect_ratio || 1,
    })) || [];

    const hasNext = count ? initialItemsCount < count : false;

    // 3. 히어로 데이터 페칭
    const { data: heroData } = await supabase
        .from("site_settings")
        .select("key, value")
        .like("key", "hero_%");
    
    const heroSettings: any = {};
    if (heroData) {
        heroData.forEach((item: { key: string; value: any }) => {
            heroSettings[item.key] = item.value;
        });
    }

    return {
        banners: bannerData || [],
        initialImages,
        nextCursor: hasNext ? initialImages.length : null,
        itemsPerPage,
        heroSettings,
    };
}

// 메인 페이지의 캐싱을 비활성화하여 실시간 데이터 반영 (대시보드 수정 즉시 반영)
export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function Home() {
    const { banners, initialImages, nextCursor, itemsPerPage, heroSettings } = await getInitialData();

    return (
        <div className="min-h-screen bg-background font-sans selection:bg-background selection:text-foreground overflow-x-hidden">
            <Navigation />

            <main className="pt-(--navbar-height)">
                <HeroHeader settings={heroSettings} />

                <BannerCarousel initialBanners={banners} />

                <GalleryView 
                    initialImages={initialImages} 
                    nextCursor={nextCursor} 
                    itemsPerPage={itemsPerPage}
                />
            </main>

            <Footer />
        </div>
    );
}
