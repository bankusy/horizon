import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "i.pinimg.com",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "assets.getliner.com",
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
            {
                protocol: "https",
                hostname: "pub-f82ee914a7694a7db796f247f32d32d2.r2.dev",
            },
            {
                protocol: "https",
                hostname: "ifhbxabvytjaqeciikhq.supabase.co"
            }
        ],
    },
};

export default nextConfig;
