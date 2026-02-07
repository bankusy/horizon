"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Settings, 
  ArrowLeft,
  User
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    title: "대시보드",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "갤러리 관리",
    url: "/admin/gallery",
    icon: ImageIcon,
  },
  {
    title: "설정",
    url: "/admin/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <SidebarHeader className="h-16 flex items-start justify-center px-6 border-b border-border mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-foreground rounded flex items-center justify-center">
            <span className="text-background font-black text-xs">H</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-tight">HORIZON</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">스튜디오 관리자</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            메인 메뉴
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-3">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                    className="h-10 px-3 rounded-md transition-all hover:bg-zinc-100 data-[active=true]:bg-zinc-100 data-[active=true]:text-foreground"
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon size={18} className={pathname === item.url ? "text-foreground" : "text-muted-foreground"} />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-10 px-3 rounded-md hover:bg-zinc-100">
              <Link href="/" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft size={18} />
                <span className="text-sm font-medium">관리자 나가기</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
