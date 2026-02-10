"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageForm } from "./ImageForm";
import { VideoForm } from "./VideoForm";
import { Image as ImageIcon, Youtube } from "lucide-react";

interface UnifiedMediaFormProps {
    onAdd: (data: any) => void;
}

export function UnifiedMediaForm({ onAdd }: UnifiedMediaFormProps) {
    const [activeTab, setActiveTab] = useState("image");

    return (
        <Card className="rounded-none border-border bg-card overflow-hidden">
            <CardHeader className="p-0 border-b border-border bg-secondary/20">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                            {activeTab === "image" ? (
                                <>
                                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                    <span>이미지 등록</span>
                                </>
                            ) : (
                                <>
                                    <Youtube className="w-5 h-5 text-red-500" />
                                    <span>영상 등록</span>
                                </>
                            )}
                        </CardTitle>
                        <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">
                            {activeTab === "image" 
                                ? "새로운 이미지를 아카이브에 업로드합니다." 
                                : "유튜브 영상 URL을 통해 아카이브에 등록합니다."}
                        </CardDescription>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                        <TabsList className="grid w-full grid-cols-2 bg-background border border-border h-10 p-1 rounded-none">
                            <TabsTrigger 
                                value="image" 
                                className="text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-secondary data-[state=active]:text-foreground rounded-none transition-all"
                            >
                                이미지 업로드
                            </TabsTrigger>
                            <TabsTrigger 
                                value="video" 
                                className="text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-secondary data-[state=active]:text-foreground rounded-none transition-all"
                            >
                                유튜브 링크
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsContent value="image" className="m-0 focus-visible:ring-0 focus-visible:outline-none">
                        <ImageForm onAdd={onAdd} />
                    </TabsContent>
                    <TabsContent value="video" className="m-0 focus-visible:ring-0 focus-visible:outline-none">
                        <VideoForm onAdd={onAdd} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
