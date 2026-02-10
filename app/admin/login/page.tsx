"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Image from "next/image";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsLoading(true);
    try {
      if (!supabase) throw new Error("Supabase is not configured.");

      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("username", username)
        .eq("password_hash", password) // In a real app, use hashing comparison
        .single();

      if (error || !data) {
        toast.error("아이디 또는 비밀번호가 일치하지 않습니다.");
        setIsLoading(false);
        return;
      }

      // Set cookie for middleware
      document.cookie = "admin_session=authenticated; path=/; max-age=86400"; // 24 hours
      
      // Set local storage for useAuth hook
      localStorage.setItem("admin_session", "authenticated");

      toast.success("환영합니다, 관리자님!");
      router.push("/admin/gallery");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("로그인 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="flex items-center justify-center mb-8 gap-1.5">
            <div className="relative w-8 h-8">
                <Image
                    src="/logo.svg"
                    alt="HORIZON Logo"
                    fill
                    className="object-contain"
                />
            </div>
            <h1 className="text-xl font-light tracking-tighter uppercase italic">HORIZON</h1>
        </div>

        <Card className="rounded-none border-border  overflow-hidden">
          <CardHeader className="p-8 pb-0 space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight">관리자 로그인</CardTitle>
            <CardDescription className="text-sm">계정 정보를 입력하여 대시보드에 접근하세요.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">아이디</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-12 rounded-none bg-zinc-50/50 border-zinc-200 focus:border-zinc-900 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">비밀번호</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 rounded-none bg-zinc-50/50 border-zinc-200 focus:border-zinc-900 transition-all font-medium"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 rounded-none font-bold bg-zinc-900 hover:bg-black text-white transition-all mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    인증 중...
                  </>
                ) : (
                  "로그인"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center mt-8 text-xs text-muted-foreground">
          &copy; 2026 HORIZON STUDIO. All rights reserved.
        </p>
      </div>
    </div>
  );
}
