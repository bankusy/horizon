"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin-sidebar";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Simple title mapping
  const getPageTitle = () => {
    if (pathname === "/admin") return "대시보드";
    if (pathname === "/admin/gallery") return "갤러리 관리";
    if (pathname === "/admin/categories") return "카테고리 관리";
    if (pathname === "/admin/settings") return "설정";
    return "대시보드";
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-screen bg-background text-foreground transition-colors duration-500">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-8 bg-background/80 backdrop-blur-xl sticky top-0 z-10 transition-colors duration-500">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4 bg-border" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin" className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                    관리자
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-muted-foreground/30" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-xs font-black uppercase tracking-widest text-foreground">
                    {getPageTitle()}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 rounded-none bg-secondary flex items-center justify-center border border-border">
                <span className="text-[10px] font-black tracking-widest text-muted-foreground">JD</span>
             </div>
          </div>
        </header>
        <div className="flex-1 p-8 md:p-12 w-full">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
