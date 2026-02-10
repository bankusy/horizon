import { Filter } from "lucide-react";
import { Category } from "@/types/gallery";

interface GalleryHeaderProps {
    selectedCategoryId: string;
    setSelectedCategoryId: (id: string) => void;
    categories: Category[];
    categoriesMap: Record<string, string>;
}

export function GalleryHeader({
    selectedCategoryId,
    setSelectedCategoryId,
    categories,
    categoriesMap,
}: GalleryHeaderProps) {
    return (
        <div className="flex flex-col xl:flex-row xl:items-end justify-between mb-12 md:mb-20 gap-8">
            <div className="border-l-8 border-brand pl-6 md:pl-10">
                <h2 className="text-5xl md:text-8xl font-light tracking-tighter mb-4 uppercase leading-none">
                    {selectedCategoryId === "All"
                        ? "Archive"
                        : categoriesMap[selectedCategoryId] || "Archive"}
                </h2>
                <p className="text-xs md:text-sm font-bold tracking-[0.3em] text-muted-foreground uppercase opacity-50">
                    Precision • Aesthetics • Innovation
                </p>
            </div>
            <div className="flex flex-nowrap gap-2 md:gap-4 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2 md:mx-0 md:px-0 items-center">
                <div className="flex items-center gap-2 mr-2 shrink-0">
                    <Filter size={14} className="opacity-40" />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-20">
                        Filter By
                    </span>
                </div>
                <button
                    key="All"
                    onClick={() => setSelectedCategoryId("All")}
                    className={`px-4 md:px-6 py-2 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full transition-all duration-700 flex items-center gap-2 whitespace-nowrap shrink-0 ${
                        selectedCategoryId === "All"
                            ? "bg-brand text-foreground shadow-2xl shadow-brand/20"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                    All
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`px-4 md:px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-500 whitespace-nowrap ${
                            selectedCategoryId === cat.id
                                ? "bg-brand text-foreground shadow-2xl shadow-brand/20"
                                : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
