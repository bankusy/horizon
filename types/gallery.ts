export interface Category {
    id: string;
    name: string;
}

export interface GalleryImage {
    id: string;
    src: string;
    alt: string;
    category_id: string;
    category_name?: string;
    type?: string;
    video_url?: string;
    width?: number;
    height?: number;
    aspect_ratio?: number;
    display_order?: number;
    globalIdx?: number; // Added for masonry grid mapping
}

export interface GalleryViewProps {
    initialImages: GalleryImage[];
    nextCursor: number | null;
}
