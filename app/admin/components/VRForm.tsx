"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Link as LinkIcon, Type, AlignLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface VRFormProps {
    onAdd: (newVR: any) => void;
}

export function VRForm({ onAdd }: VRFormProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase || !file || !title || !linkUrl) {
            toast.error("모든 필드를 채워주세요 (썸네일 포함).");
            return;
        }

        setIsUploading(true);
        try {
            // 1. Upload Thumbnail
            const fileExt = file.name.split(".").pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `vr/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("images")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from("images")
                .getPublicUrl(filePath);

            // 2. Insert into DB
            const { data, error } = await supabase
                .from("vr_contents")
                .insert({
                    title,
                    description,
                    thumbnail_url: publicUrl,
                    link_url: linkUrl,
                    display_order: 0, // Will be managed later or handled by DB
                })
                .select()
                .single();

            if (error) throw error;

            onAdd(data);
            toast.success("VR 콘텐츠가 등록되었습니다.");
            
            // Reset form
            setTitle("");
            setDescription("");
            setLinkUrl("");
            setFile(null);
        } catch (error: any) {
            console.error("VR upload error:", error);
            toast.error("등록에 실패했습니다.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-card border-b border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Left Side: Upload */}
                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Thumbnail Image</Label>
                   <div className="relative group">
                        <label className={`flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-none transition-all cursor-pointer ${file ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-secondary/50'}`}>
                            {file ? (
                                <div className="absolute inset-0 p-2">
                                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover rounded-none" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white text-[10px] font-bold uppercase tracking-widest">Change Image</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 text-muted-foreground/30 mb-4" />
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Click or Drag to Upload</p>
                                </div>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        </label>
                   </div>
                </div>

                {/* Right Side: Data */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Type size={12} /> Title
                        </Label>
                        <Input 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            placeholder="VR Project Title" 
                            className="rounded-none border-border h-12 text-sm focus-visible:ring-primary/20"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <AlignLeft size={12} /> Description
                        </Label>
                        <Input 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            placeholder="Short description (optional)" 
                            className="rounded-none border-border h-12 text-sm focus-visible:ring-primary/20"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <LinkIcon size={12} /> VR Link URL
                        </Label>
                        <Input 
                            value={linkUrl} 
                            onChange={(e) => setLinkUrl(e.target.value)} 
                            placeholder="https://my-vr-project.com" 
                            className="rounded-none border-border h-12 text-sm focus-visible:ring-primary/20"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-8 border-t border-border">
                <Button 
                    type="submit" 
                    disabled={isUploading}
                    className="rounded-none px-12 h-14 font-black uppercase tracking-widest text-[11px] transition-all duration-500"
                >
                    {isUploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Upload className="mr-2 h-4 w-4 stroke-3" />
                    )}
                    Register VR Content
                </Button>
            </div>
        </form>
    );
}
