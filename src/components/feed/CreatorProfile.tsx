"use client";

import { useState } from "react";
import { UserPlus, UserCheck, MapPin, Link2, Grid, Sparkles, Image as ImageIcon, Paintbrush } from "lucide-react";
import { Post } from "@/lib/types";
import BentoGrid from "./BentoGrid";

interface CreatorProfileProps {
  user: {
    id: string;
    userName: string;
    userHandle: string;
    userAvatar: string;
    userCover?: string;
    userBio?: string;
    userFollowersCount: number;
    userFollowingCount: number;
    website?: string;
    location?: string;
  };
  posts: Post[];
  onPostClick: (post: Post) => void;
  onLikeToggle: (postId: string, e: React.MouseEvent) => void;
  onFollowToggle: (userId: string) => void;
  onEditProfileClick?: () => void;
  isOwnProfile: boolean;
  theme: "dark" | "light";
}

type FilterType = "all" | "ai_art" | "photography" | "design" | "illustration" | "rising_stars";

export default function CreatorProfile({
  user,
  posts,
  onPostClick,
  onLikeToggle,
  onFollowToggle,
  onEditProfileClick,
  isOwnProfile,
  theme,
}: CreatorProfileProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [isFollowingLocal, setIsFollowingLocal] = useState(false); // Default is false for mock

  const filteredPosts = posts.filter((post) => {
    if (activeFilter === "all") return true;
    return post.contentType === activeFilter;
  });

  const handleFollowClick = () => {
    setIsFollowingLocal(!isFollowingLocal);
    onFollowToggle(user.id);
  };

  const getFilterIcon = (type: FilterType) => {
    switch (type) {
      case "all": return <Grid className="w-3.5 h-3.5" />;
      case "ai_art": return <Sparkles className="w-3.5 h-3.5" />;
      case "photography": return <ImageIcon className="w-3.5 h-3.5" />;
      case "design": return <Paintbrush className="w-3.5 h-3.5" />;
      default: return <Grid className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-16">
      {/* 1. Cover Photo Hero */}
      <div className="w-full h-44 sm:h-56 relative bg-gradient-to-r from-orange-primary/10 via-orange-primary/20 to-orange-primary/5 overflow-hidden">
        {/* Playful abstract grid inside cover to match bento feel */}
        <div className="absolute inset-0 opacity-15" style={{ 
          backgroundImage: 'radial-gradient(var(--color-orange-primary) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px' 
        }} />
        <div className={`absolute inset-0 bg-gradient-to-t to-transparent ${
          theme === "dark" ? "from-[#0E0E10]" : "from-white"
        }`} />
      </div>

      {/* 2. User Info Overlap Block */}
      <div className="px-4 sm:px-6 -mt-16 sm:-mt-20 relative z-10 flex flex-col items-start gap-4">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[12px] bg-orange-primary border-[4px] border-white dark:border-[#0E0E10] flex items-center justify-center font-display font-black text-3xl text-white shadow-md select-none transition-colors">
          {user.userName.charAt(0)}
        </div>

        {/* Profile Header Row */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 mt-2">
          <div className="flex flex-col">
            <h1 className="font-display font-black text-2xl text-gray-900 dark:text-white tracking-tight">
              {user.userName}
            </h1>
            <span className="text-sm font-bold text-orange-primary">
              @{user.userHandle}
            </span>
          </div>

          {/* Social CTAs */}
          {!isOwnProfile ? (
            <button
              onClick={handleFollowClick}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-[8px] text-xs font-bold tracking-wide transition-all border shadow-sm ${
                isFollowingLocal
                  ? "bg-transparent text-gray-500 border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800/50"
                  : "bg-orange-primary text-white border-orange-primary hover:bg-orange-hover"
              }`}
            >
              {isFollowingLocal ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Follow</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onEditProfileClick}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-[8px] text-xs font-bold tracking-wide transition-all border shadow-sm bg-white dark:bg-[#1E1E21] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-[#2A2A2E] hover:text-gray-900 dark:hover:text-white"
            >
              <Paintbrush className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {/* Stats segment */}
        <div className="flex items-center gap-5 mt-1 border-t border-b border-gray-100 dark:border-zinc-800/80 py-3 w-full sm:w-auto font-semibold text-xs text-gray-600 dark:text-gray-400">
          <span>
            <strong className="text-gray-900 dark:text-white font-bold text-sm">{posts.length}</strong> creations
          </span>
          <span>
            <strong className="text-gray-900 dark:text-white font-bold text-sm">
              {user.userFollowersCount + (isFollowingLocal ? 1 : 0)}
            </strong> followers
          </span>
          <span>
            <strong className="text-gray-900 dark:text-white font-bold text-sm">{user.userFollowingCount}</strong> following
          </span>
        </div>

        {/* Bio Text */}
        {user.userBio && (
          <p className="max-w-xl text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-1">
            {user.userBio}
          </p>
        )}

        {/* Meta Coordinates */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
          {user.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-orange-primary" />
              <span>{user.location}</span>
            </span>
          )}
          {user.website && (
            <a 
              href={`https://${user.website}`}
              target="_blank"
              rel="noopener noreferrer" 
              className="flex items-center gap-1 text-orange-primary hover:underline"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>{user.website}</span>
            </a>
          )}
        </div>
      </div>

      {/* 3. Category Filter Tab Row */}
      <div className="px-4 mt-8 flex flex-wrap gap-2 items-center border-b border-gray-100 dark:border-zinc-800/80 pb-3">
        {(["all", "ai_art", "photography", "design", "illustration"] as FilterType[]).map((type) => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] text-xs font-bold uppercase tracking-wider transition-all border ${
              activeFilter === type
                ? "bg-orange-primary text-white border-orange-primary shadow-sm"
                : "bg-white dark:bg-[#1E1E21] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-zinc-800 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#2A2A2E]"
            }`}
          >
            {getFilterIcon(type)}
            <span>
              {type === "all" && "All Posts"}
              {type === "ai_art" && "AI Art"}
              {type === "photography" && "Photo"}
              {type === "design" && "Design"}
              {type === "illustration" && "Illust"}
            </span>
          </button>
        ))}
      </div>

      {/* 4. Portfolio Grid */}
      {filteredPosts.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-[#1E1E21] border border-gray-100 dark:border-zinc-800 flex items-center justify-center text-gray-400 dark:text-gray-500">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white">No Posts Found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[240px]">
              No posts matches this filter category. Stay tuned for future designs!
            </p>
          </div>
        </div>
      ) : (
        <BentoGrid
          posts={filteredPosts}
          onPostClick={onPostClick}
          onLikeToggle={onLikeToggle}
        />
      )}
    </div>
  );
}
