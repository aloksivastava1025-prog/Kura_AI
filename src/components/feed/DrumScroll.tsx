"use client";

import { useState, useRef } from "react";
import { Heart, MessageCircle, Share2, Sparkles, UserPlus, UserCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Post } from "@/lib/types";

interface DrumScrollProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
  onLikeToggle: (postId: string, e: React.MouseEvent) => void;
  onFollowToggle: (userId: string, e: React.MouseEvent) => void;
}

export default function DrumScroll({
  posts,
  onPostClick,
  onLikeToggle,
  onFollowToggle,
}: DrumScrollProps) {
  const [doubleTapHeart, setDoubleTapHeart] = useState<{ x: number; y: number; id: string } | null>(null);
  const lastTap = useRef<{ [key: string]: number }>({});

  const handleDoubleTap = (postId: string, e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    
    if (lastTap.current[postId] && now - lastTap.current[postId] < DOUBLE_PRESS_DELAY) {
      // It's a double tap!
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setDoubleTapHeart({ x, y, id: postId });
      
      // If not already liked, toggle like
      const post = posts.find(p => p.id === postId);
      if (post && !post.isLiked) {
        onLikeToggle(postId, e);
      }
      
      // Auto clear heart animation
      setTimeout(() => {
        setDoubleTapHeart(null);
      }, 800);
    } else {
      lastTap.current[postId] = now;
    }
  };

  return (
    <div className="drum-container no-scrollbar relative w-full">
      {posts.map((post) => (
        <div key={post.id} className="drum-slide flex flex-col justify-center items-center">
          {/* Main Visual Frame */}
          <div 
            className="w-full h-full relative flex items-center justify-center cursor-pointer select-none overflow-hidden bg-black"
            onClick={(e) => handleDoubleTap(post.id, e)}
          >
            {/* Blurred Background for aspect ratio fill */}
            <div 
              className="absolute inset-0 scale-125 blur-[40px] opacity-60 z-0 bg-cover bg-center pointer-events-none transition-opacity duration-500"
              style={{ backgroundImage: `url(${post.thumbnailUrl})` }}
            />

            {/* Dark overlay to ensure text readability */}
            <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none" />

            <img
              src={post.thumbnailUrl}
              alt={post.title}
              className="w-full h-full object-contain relative z-10 select-none pointer-events-none drop-shadow-2xl"
            />

            {/* Premium cinematic bottom gradient */}
            <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-20" />

            {/* Floating Animated Double-Tap Heart */}
            <AnimatePresence>
              {doubleTapHeart && doubleTapHeart.id === post.id && (
                <motion.div
                  initial={{ scale: 0, opacity: 0, rotate: -15 }}
                  animate={{ scale: [0, 1.2, 0.9, 1], opacity: [0, 1, 1, 0] }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  style={{ 
                    position: "absolute", 
                    left: doubleTapHeart.x - 40, 
                    top: doubleTapHeart.y - 40,
                    pointerEvents: "none",
                    zIndex: 40
                  }}
                  className="text-white"
                >
                  <Heart className="w-20 h-20 fill-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Left side Metadata overlay */}
            <div className="absolute bottom-8 left-4 md:left-8 right-20 text-white z-30 flex flex-col items-start gap-4">
              
              {/* Creator details */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-sans font-bold text-lg shadow-lg">
                  {post.userName.charAt(0)}
                </div>
                <div className="flex flex-col drop-shadow-md">
                  <span className="font-bold text-sm tracking-wide text-white">
                    @{post.userHandle}
                  </span>
                  <span className="text-[11px] text-gray-300 font-medium tracking-wide">
                    {post.contentType === 'ai_art' && 'AI Creator'}
                    {post.contentType === 'photography' && 'Photographer'}
                    {post.contentType === 'design' && 'Designer'}
                    {post.contentType === 'illustration' && 'Illustrator'}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFollowToggle(post.userId, e);
                  }}
                  className={`ml-3 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all duration-300 border backdrop-blur-md flex items-center gap-1.5 ${
                    post.isFollowing
                      ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
                      : "bg-white text-black border-white hover:bg-gray-200"
                  }`}
                >
                  {post.isFollowing ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              </div>

              {/* Title & Description */}
              <div className="flex flex-col gap-2 max-w-[85%] md:max-w-lg drop-shadow-lg">
                <h2 
                  onClick={(e) => {
                    e.stopPropagation();
                    onPostClick(post);
                  }}
                  className="font-sans font-bold text-2xl sm:text-3xl tracking-tight leading-tight text-white hover:text-gray-200 transition-colors cursor-pointer"
                >
                  {post.title}
                </h2>
                <p className="text-sm text-gray-200 leading-relaxed line-clamp-2 md:line-clamp-3 font-medium opacity-90">
                  {post.description}
                </p>
              </div>

              {/* Tags & AI badge */}
              <div className="flex flex-wrap items-center gap-2 mt-1 drop-shadow-md">
                {post.aiEngine && (
                  <span className="flex items-center gap-1.5 bg-white text-black px-2.5 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-wider shadow-lg">
                    <Sparkles className="w-3 h-3" />
                    <span>{post.aiEngine}</span>
                  </span>
                )}
                {post.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-[6px] text-[11px] text-gray-100 font-medium border border-white/10 hover:bg-black/50 transition-colors cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right side interactive button sidebar */}
            <div className="absolute bottom-8 right-4 md:right-8 z-30 flex flex-col items-center gap-5 text-white">
              {/* Like post */}
              <div className="flex flex-col items-center gap-1.5 drop-shadow-lg">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLikeToggle(post.id, e);
                  }}
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-black/20 backdrop-blur-xl border border-white/15 hover:bg-white/10 text-white transition-all duration-300 hover:scale-105"
                >
                  <Heart className={`w-6 h-6 transition-colors duration-300 ${post.isLiked ? "fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" : "text-white"}`} />
                </button>
                <span className="text-[12px] font-bold tracking-wide text-white">{post.likeCount}</span>
              </div>

              {/* Open detail view (comments) */}
              <div className="flex flex-col items-center gap-1.5 drop-shadow-lg">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPostClick(post);
                  }}
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-black/20 backdrop-blur-xl border border-white/15 hover:bg-white/10 text-white transition-all duration-300 hover:scale-105"
                >
                  <MessageCircle className="w-6 h-6" />
                </button>
                <span className="text-[12px] font-bold tracking-wide text-white">{post.commentCount}</span>
              </div>

              {/* Share link */}
              <div className="flex flex-col items-center gap-1.5 drop-shadow-lg">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                    alert("Post URL copied to clipboard!");
                  }}
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-black/20 backdrop-blur-xl border border-white/15 hover:bg-white/10 text-white transition-all duration-300 hover:scale-105"
                >
                  <Share2 className="w-6 h-6" />
                </button>
                <span className="text-[12px] font-bold tracking-wide text-white">Share</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
