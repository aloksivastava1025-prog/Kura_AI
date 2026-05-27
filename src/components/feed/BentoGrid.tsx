"use client";

import { useState } from "react";
import { Heart, MessageCircle, ArrowUpRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Post } from "@/lib/types";

interface BentoGridProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
  onLikeToggle: (postId: string, e: React.MouseEvent) => void;
}

export default function BentoGrid({
  posts,
  onPostClick,
  onLikeToggle,
}: BentoGridProps) {
  
  // Fallback vibrant colors matching the Bolt reference palette
  const bentoColors = [
    "bg-[#DBFF00]", // Neon Yellow
    "bg-[#111111]", // Dark
    "bg-[#FF3366]", // Pink/Red
    "bg-[#2B5BFF]", // Blue
    "bg-[#A655FF]", // Purple
    "bg-[#FF5A00]", // Brand Orange
  ];

  // Dynamic shadows matching card fallbacks for immersive glow effects
  const shadowGlows: { [key: string]: string } = {
    "bg-[#DBFF00]": "hover:shadow-[0_20px_50px_rgba(219,255,0,0.2)]",
    "bg-[#111111]": "hover:shadow-[0_20px_50px_rgba(255,255,255,0.08)] hover:border hover:border-white/10",
    "bg-[#FF3366]": "hover:shadow-[0_20px_50px_rgba(255,51,102,0.25)]",
    "bg-[#2B5BFF]": "hover:shadow-[0_20px_50px_rgba(43,91,255,0.25)]",
    "bg-[#A655FF]": "hover:shadow-[0_20px_50px_rgba(166,85,255,0.25)]",
    "bg-[#FF5A00]": "hover:shadow-[0_20px_50px_rgba(255,90,0,0.25)]",
  };

  // Asymmetrical visual weight via index-based custom borders
  const getAsymmetricalBorder = (index: number) => {
    const borders = [
      "rounded-[4px]",
      "rounded-[5px]",
      "rounded-[3px]",
      "rounded-[4px]",
    ];
    return borders[index % borders.length];
  };

  return (
    <div className="w-full h-full max-w-[1600px] mx-auto py-2">
      {/* 
        True Masonry Layout using CSS Columns.
        Using fewer columns (max 3) so images remain very LARGE.
        This guarantees 100% perfect original aspect ratio (0% cropping) 
        because height scales naturally based on the image's original ratio.
      */}
      <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4 w-full">
        <AnimatePresence>
          {posts.map((post, index) => {
            const fallbackColor = bentoColors[index % bentoColors.length];
            
            return (
              <motion.div
                key={post.id}
                layoutId={`post-card-${post.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: (index % 10) * 0.03 }}
                onClick={() => onPostClick(post)}
                className={`group relative overflow-hidden cursor-pointer mb-3 sm:mb-4 break-inside-avoid transition-all duration-500 ease-out hover:-translate-y-1.5 ${fallbackColor} ${shadowGlows[fallbackColor] || ""} ${getAsymmetricalBorder(index)}`}
              >
                {/* 
                  Image Layer:
                  Using w-full h-auto so the image dictates the block height natively.
                  This ensures the PERFECT original aspect ratio with no letterboxing or cropping.
                */}
                {post.thumbnailUrl ? (
                  <img
                    src={post.thumbnailUrl}
                    alt={post.title}
                    className="w-full h-auto block object-cover transform group-hover:scale-[1.03] transition-transform duration-700 ease-out z-0"
                    loading="lazy"
                  />
                ) : (
                  // Fallback for text-only blocks
                  <div className="w-full aspect-square flex items-center justify-center p-6 z-0">
                    <h3 className={`font-display font-black text-2xl md:text-3xl lg:text-4xl leading-none text-center ${fallbackColor === 'bg-[#111111]' ? 'text-white' : 'text-[#111111]'}`}>
                      {post.title}
                    </h3>
                  </div>
                )}
                
                {/* Immersive Glassmorphic Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[6px] opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out z-10 flex flex-col justify-between p-4 sm:p-5">
                  {/* Top Bar: Action Buttons */}
                  <div className="flex justify-between items-start w-full">
                    {/* Visual Cues for premium gallery feel */}
                    <div className="p-2 bg-white/10 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all duration-350 transform -translate-y-2 group-hover:translate-y-0">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onLikeToggle(post.id, e);
                      }}
                      className={`p-2.5 rounded-full backdrop-blur-md transition-colors duration-200 ${
                        post.isLiked
                          ? "bg-white text-[#FF3366] shadow-lg"
                          : "bg-white/20 text-white hover:bg-white hover:text-[#111111]"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.isLiked ? "fill-current" : ""}`} strokeWidth={2.5} />
                    </motion.button>
                  </div>

                  {/* Bottom Bar: Title & User */}
                  <div className="flex flex-col gap-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white font-display font-bold text-lg leading-tight line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="flex items-center justify-between text-white/90 w-full mt-1">
                      <span className="text-sm font-medium tracking-wide">
                        @{post.userHandle}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-bold bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
                        <MessageCircle className="w-3 h-3 fill-white/20" />
                        {post.commentCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI / Content Tag */}
                {post.contentType === 'ai_art' && (
                  <div className="absolute bottom-4 right-4 bg-[#DBFF00] text-[#111] px-2.5 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider shadow-lg z-20 opacity-100 group-hover:opacity-0 transition-opacity duration-200">
                    AI Gen
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
