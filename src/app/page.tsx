"use client";

import { useState, useEffect } from "react";
import { Search, Sparkles, Image as ImageIcon, Paintbrush, Grid, Sliders, ChevronDown } from "lucide-react";
import { Post } from "@/lib/types";
import { api } from "@/lib/api";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import BentoGrid from "@/components/feed/BentoGrid";
import DrumScroll from "@/components/feed/DrumScroll";
import PostDetailModal from "@/components/feed/PostDetailModal";
import CreatorProfile from "@/components/feed/CreatorProfile";
import UploadModal from "@/components/feed/UploadModal";
import BentoSkeleton from "@/components/ui/BentoSkeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import AuthModal from "@/components/auth/AuthModal";
import EditProfileModal from "@/components/feed/EditProfileModal";
import SettingsModal from "@/components/layout/SettingsModal";

type FilterType = "all" | "ai_art" | "photography" | "design" | "illustration" | "rising_stars";

export default function Home() {
  const { addToast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch posts from API
  // (Removed redundant initial fetch since the activeCategory useEffect runs on mount)

  const [currentView, setCurrentView] = useState<"grid" | "scroll">("grid");
  const [activeTab, setActiveTab] = useState<"home" | "profile" | "search">("home");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FilterType>("all");

  useEffect(() => {
    const fetchCategoryPosts = async () => {
      try {
        setIsLoading(true);
        const data = await api.getPosts({ contentType: activeCategory === "all" ? undefined : activeCategory });
        setPosts(data.posts);
      } catch (err) {
        console.error("Failed to load category posts:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategoryPosts();
  }, [activeCategory]);

  const [activeUser, setActiveUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Helper to wrap actions that require authentication
  const requireAuth = (callback: () => void) => {
    if (activeUser) {
      callback();
    } else {
      setIsAuthOpen(true);
    }
  };

  // Fetch real profile if token exists (Guest support)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("pin_ai_token");
        if (token) {
          const userRes = await api.getMe();
          setActiveUser({
            id: userRes.user.id || userRes.user._id,
            userName: userRes.user.userName,
            userHandle: userRes.user.userHandle,
            userAvatar: userRes.user.avatar,
            userFollowersCount: userRes.user.followersCount || 0,
            userFollowingCount: userRes.user.followingCount || 0,
            userBio: userRes.user.bio || "",
            website: userRes.user.website || "",
            location: userRes.user.location || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch authenticated user profile:", err);
        // If token is invalid, clear it
        localStorage.removeItem("pin_ai_token");
      }
    };
    fetchUser();
  }, []);

  // Interactive Overlays
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Follow states tracker (mocking profile counts)
  const [userFollowCounts, setUserFollowCounts] = useState<{ [key: string]: number }>({
    user1: 1240,
    user2: 420,
    user3: 3840,
  });

  // Calculate post counts for the sidebar
  const postCounts = {
    all: posts.length,
    ai_art: posts.filter(p => p.contentType === 'ai_art').length,
    photography: posts.filter(p => p.contentType === 'photography').length,
    design: posts.filter(p => p.contentType === 'design').length,
    illustration: posts.filter(p => p.contentType === 'illustration').length,
  };

  // Dynamic actions
  const handleLikeToggle = (postId: string) => {
    requireAuth(async () => {
      try {
        // Optimistic update
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                ...post,
                isLiked: !post.isLiked,
                likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
              }
              : post
          )
        );

        // Also update selected post if it's currently open
        setSelectedPost((prevSelected) => {
          if (prevSelected && prevSelected.id === postId) {
            return {
              ...prevSelected,
              isLiked: !prevSelected.isLiked,
              likeCount: prevSelected.isLiked
                ? prevSelected.likeCount - 1
                : prevSelected.likeCount + 1,
            };
          }
          return prevSelected;
        });

        // API call
        await api.toggleLike(postId);
      } catch (err) {
        console.error("Failed to toggle like:", err);
      }
    });
  };

  const handleFollowToggle = (userId: string) => {
    requireAuth(async () => {
      try {
        // Optimistic update
        setSelectedPost((prevSelected) => {
          if (prevSelected && prevSelected.userId === userId) {
            const currentlyFollowing = prevSelected.isFollowing;
            return {
              ...prevSelected,
              isFollowing: !currentlyFollowing,
              userFollowersCount: currentlyFollowing
                ? prevSelected.userFollowersCount - 1
                : prevSelected.userFollowersCount + 1,
            };
          }
          return prevSelected;
        });

        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.userId === userId) {
              const currentlyFollowing = post.isFollowing;
              return {
                ...post,
                isFollowing: !currentlyFollowing,
                userFollowersCount: currentlyFollowing
                  ? post.userFollowersCount - 1
                  : post.userFollowersCount + 1,
              };
            }
            return post;
          })
        );

        setUserFollowCounts((prev) => {
          const currentCount = prev[userId] || 0;
          return {
            ...prev,
            [userId]: currentCount + 1, 
          };
        });

        // API call
        await api.toggleFollow(userId);
      } catch (err) {
        console.error("Failed to toggle follow:", err);
      }
    });
  };

  const handleAddComment = (postId: string, commentBody: string) => {
    requireAuth(async () => {
      try {
        const res = await api.addComment(postId, commentBody);
        const newComment = res.comment;

        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                commentCount: post.commentCount + 1,
                comments: [newComment, ...post.comments],
              };
            }
            return post;
          })
        );

        // Update selected post details modal
        setSelectedPost((prevSelected) => {
          if (prevSelected && prevSelected.id === postId) {
            return {
              ...prevSelected,
              commentCount: prevSelected.commentCount + 1,
              comments: [newComment, ...prevSelected.comments],
            };
          }
          return prevSelected;
        });
      } catch (err) {
        console.error("Failed to add comment:", err);
        addToast("Failed to post comment.", "error");
      }
    });
  };

  const handleDeletePost = (postId: string) => {
    requireAuth(async () => {
      if (!confirm("Are you sure you want to delete this post?")) return;
      
      setSelectedPost(null);
      setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
      
      try {
        await api.deletePost(postId);
        addToast("Post deleted successfully.", "success");
      } catch (err) {
        console.error("Failed to delete post:", err);
        addToast("Failed to delete post.", "error");
      }
    });
  };

  const handleLogout = () => {
    // Clear user state
    setActiveUser(null);
    // Remove local storage token
    localStorage.removeItem("pin_ai_token");
    // Optionally redirect or reset state
    setActiveTab("home");
    addToast("Logged out successfully.", "success");
  };

  const handleEditPost = (postId: string, updatedFields: Partial<Post>) => {
    requireAuth(async () => {
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, ...updatedFields } : p));
      setSelectedPost((prev) => prev && prev.id === postId ? { ...prev, ...updatedFields } : prev);
      
      try {
        await api.editPost(postId, updatedFields);
        addToast("Post updated successfully.", "success");
      } catch (err) {
        console.error("Failed to edit post:", err);
        addToast("Failed to edit post.", "error");
      }
    });
  };

  const handleSaveProfile = async (updatedData: any) => {
    try {
      const res = await api.editUserProfile(updatedData);
      setActiveUser({
        id: res.user.id || res.user._id,
        userName: res.user.userName,
        userHandle: res.user.userHandle,
        userAvatar: res.user.avatar,
        userFollowersCount: res.user.followersCount || 0,
        userFollowingCount: res.user.followingCount || 0,
        userBio: res.user.bio || "",
        website: res.user.website || "",
        location: res.user.location || "",
      });

      // Synchronize their author details on all local posts instantly
      setPosts((prev) =>
        prev.map((p) =>
          p.userId === (res.user.id || res.user._id)
            ? {
                ...p,
                userName: res.user.userName,
                userHandle: res.user.userHandle,
                userAvatar: res.user.avatar,
              }
            : p
        )
      );

      addToast("Profile updated successfully.", "success");
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      addToast(err.message || "Failed to update profile.", "error");
      throw err;
    }
  };

  const handleDownload = (post: Post) => {
    requireAuth(async () => {
      try {
        addToast("Preparing high-res download...", "info");
        const imageUrl = post.imageUrls?.[0] || post.thumbnailUrl;
        
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error("Network response failed");
        
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = blobUrl;
        
        const extension = imageUrl.split(".").pop()?.split("?")[0] || "jpg";
        const cleanTitle = post.title.toLowerCase().replace(/[^a-z0-9]/g, "_");
        link.download = `${cleanTitle}_highres.${extension}`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(blobUrl);
        addToast("High-res download complete!", "success");
      } catch (error) {
        console.error("Download failed:", error);
        addToast("Failed to download high-resolution image.", "error");
      }
    });
  };



  const handleUploadSuccess = async (newPostData: any) => {
    try {
      // Remove temporary frontend properties before sending to backend
      const { id, createdAt, userName, userHandle, userAvatar, ...dataForBackend } = newPostData;
      
      const res = await api.createPost(dataForBackend);
      if (res.post) {
        setPosts((prevPosts) => [res.post, ...prevPosts]);
        addToast("Post published successfully!", "success");
      }
    } catch (err) {
      console.error("Failed to create post:", err);
      addToast("Failed to create post. Please make sure you are logged in.", "error");
    }
  };

  // Click on a post -> opens modal
  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  const resetToHomeFeed = () => {
    setSelectedCreatorId(null);
    setActiveTab("home");
    setActiveCategory("all");
    setSearchQuery("");
  };

  // Filter posts based on Search query & Category tabs (Note: rising_stars is handled by the backend API)
  const getFilteredPosts = () => {
    let filtered = posts;

    // We no longer filter "rising_stars" here, the API returns the correct posts!
    if (activeCategory !== "all" && activeCategory !== "rising_stars") {
      filtered = filtered.filter(post => post.contentType === activeCategory);
    }

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((post) => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.userHandle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const activeFilteredPosts = getFilteredPosts();
  const currentCreator = selectedCreatorId 
    ? {
        id: selectedCreatorId,
        userName: posts.find(p => p.userId === selectedCreatorId)?.userName || "Unknown",
        userHandle: posts.find(p => p.userId === selectedCreatorId)?.userHandle || "@unknown",
        userAvatar: posts.find(p => p.userId === selectedCreatorId)?.userAvatar || "/avatars/default.jpg",
        userFollowersCount: 120,
        userFollowingCount: 45,
      }
    : null;
  const ownPosts = posts.filter(p => p.userId === activeUser?.id);

  // Sync HTML tag class with theme state
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className={`flex min-h-screen relative overflow-hidden font-sans transition-colors duration-500 ${
      theme === "dark" ? "bg-[#0E0E10] dark-grid-pattern text-white" : "bg-white light-grid-pattern text-gray-900"
    }`}>
      {/* Abstract Glowing Atmosphere Blobs */}
      {theme === "dark" && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
          {/* Blob 1 - Orange Glow */}
          <motion.div
            animate={{
              x: [0, 80, -40, 0],
              y: [0, -60, 40, 0],
              scale: [1, 1.15, 0.9, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-orange-primary/5 blur-[120px]"
          />
          {/* Blob 2 - Blue Glow */}
          <motion.div
            animate={{
              x: [0, -100, 60, 0],
              y: [0, 80, -60, 0],
              scale: [1, 0.85, 1.1, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[#2B5BFF]/5 blur-[130px]"
          />
          {/* Blob 3 - Purple Glow */}
          <motion.div
            animate={{
              x: [0, 50, -80, 0],
              y: [0, 100, -40, 0],
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-20 right-0 w-[500px] h-[500px] rounded-full bg-[#A655FF]/5 blur-[110px]"
          />
        </div>
      )}  {/* Sidebar - Hidden on mobile */}
      <Sidebar
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          if (view === "scroll") {
            setActiveTab("home");
            setSelectedCreatorId(null);
          }
        }}
        onUploadClick={() => requireAuth(() => setIsUploadOpen(true))}
        onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")}
        onProfileClick={() => requireAuth(() => {
          setSelectedCreatorId(activeUser?.id || "user_active");
          setActiveTab("profile");
        })}
        onSettingsClick={() => setIsSettingsOpen(true)}
        activeUser={activeUser}
        onHomeClick={resetToHomeFeed}
        currentTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === "home") {
            setSelectedCreatorId(null);
          } else if (tab === "profile") {
            setSelectedCreatorId(activeUser?.id || "user_active");
          }
        }}
        activeCategory={activeCategory}
        setActiveCategory={(cat) => setActiveCategory(cat as FilterType)}
        postCounts={postCounts}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        theme={theme}
      />

      {/* Main Panel Content - Pushed over for Sidebar */}
      <main className={`flex-1 flex flex-col min-w-0 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 pt-16 md:pt-0 transition-all duration-300 ease-in-out z-10 relative ${
        isSidebarCollapsed ? "md:ml-[80px]" : "md:ml-[280px]"
      }`}>

        {/* Mobile Top Navbar (since sidebar is hidden) */}
        <div className={`md:hidden fixed left-0 right-0 top-0 z-50 w-full px-4 py-3 flex items-center justify-between border-b backdrop-blur-md transition-colors duration-300 ${
          theme === "dark" ? "bg-[#161616]/95 border-[#2A2A2A] text-white" : "bg-white/95 border-gray-200 text-gray-900 shadow-sm"
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 flex items-center justify-center shrink-0 transition-all duration-300 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              <svg width="20" height="20" viewBox="0 0 14 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="butt">
                <path d="M12 3 L3 12 L12 21" strokeLinejoin="round" />
              </svg>
            </div>
            <span className={`font-sans font-extrabold text-[20px] tracking-tighter whitespace-nowrap ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              ura<span className="text-orange-primary text-2xl leading-[0] relative top-[2px]">.</span>
            </span>
          </div>
          {/* Feed Toggle for Mobile */}
          <div className={`flex items-center p-0.5 rounded-[9px] border transition-colors ${
            theme === "dark" ? "bg-[#222] border-[#333]" : "bg-gray-100 border-gray-200"
          }`}>
            <button
              onClick={() => setCurrentView("grid")}
              className={`px-2.5 py-1 rounded-[7px] text-[10px] font-bold transition-colors ${
                currentView === "grid" 
                  ? "bg-orange-primary text-white" 
                  : (theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900")
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setCurrentView("scroll")}
              className={`px-2.5 py-1 rounded-[7px] text-[10px] font-bold transition-colors ${
                currentView === "scroll" 
                  ? "bg-orange-primary text-white" 
                  : (theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900")
              }`}
            >
              Scroll
            </button>
          </div>
        </div>

        {/* Floating Search Bar */}
        {(activeTab === "search" || activeTab === "home") && currentView === "grid" && (
          <div className={`fixed top-20 md:top-6 z-40 flex justify-center pointer-events-none transition-all duration-300 left-0 right-0 ${
            isSidebarCollapsed ? "md:left-[80px]" : "md:left-[280px]"
          }`}>
            <div className={`w-full max-w-[95%] md:max-w-xl px-2 md:px-4 pointer-events-auto`}>
              <div className={`w-full relative rounded-2xl flex items-center transition-all group px-4 py-2.5 backdrop-blur-xl border shadow-[0_8px_32px_rgba(0,0,0,0.12)] ${
                theme === "dark" 
                  ? "bg-[#0B0B0C]/80 border-white/10 focus-within:border-orange-primary/40 focus-within:bg-[#0B0B0C]" 
                  : "bg-white/90 border-gray-200 focus-within:border-orange-primary/40 focus-within:bg-white"
              }`}>
                <span className="text-gray-400 group-focus-within:text-orange-primary transition-colors shrink-0 mr-3">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search AI art, styles, prompts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full bg-transparent text-[15px] focus:outline-none ${
                    theme === "dark" ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "home" || activeTab === "search" ? (
          /* Home / Discovery Mode */
          <div className={`w-full flex-1 ${currentView === "grid" ? "pt-20 md:pt-24" : ""}`}>

            {/* Dynamic Feed Selection */}
            {currentView === "grid" ? (
              isLoading ? (
                <div className="px-2 md:px-6 lg:px-8 pt-8 md:pt-10 pb-8 bg-transparent min-h-screen rounded-t-[32px] md:rounded-none">
                  <BentoSkeleton />
                </div>
              ) : activeFilteredPosts.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#222] border border-[#333] flex items-center justify-center text-gray-400 shadow-sm">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-white">No results found</h3>
                    <p className="text-sm text-gray-400 mt-1.5 max-w-[280px] mx-auto">
                      We couldn't find any creations matching "{searchQuery}". Try different keywords!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="px-2 md:px-6 lg:px-8 pt-8 md:pt-10 pb-8 bg-transparent min-h-screen rounded-t-[32px] md:rounded-none">
                  <BentoGrid
                    posts={activeFilteredPosts}
                    onPostClick={handlePostClick}
                    onLikeToggle={(id, e) => {
                      e.stopPropagation();
                      handleLikeToggle(id);
                    }}
                  />
                </div>
              )
            ) : (
              /* Snapping Immersive Drum Scroll */
              <DrumScroll
                posts={posts}
                onPostClick={handlePostClick}
                onLikeToggle={(id, e) => {
                  e.stopPropagation();
                  handleLikeToggle(id);
                }}
                onFollowToggle={(id, e) => {
                  e.stopPropagation();
                  handleFollowToggle(id);
                }}
              />
            )}

          </div>
        ) : (
          /* Profile Mode */
          <div className="w-full flex-1 animate-fade-in bg-transparent">
            {selectedCreatorId === activeUser?.id ? (
              /* Viewing active own profile */
              <CreatorProfile
                user={{
                  ...activeUser,
                  userFollowersCount: activeUser?.userFollowersCount || 0,
                  userFollowingCount: activeUser?.userFollowingCount || 0,
                  website: activeUser?.website || "",
                  location: activeUser?.location || ""
                }}
                posts={ownPosts}
                onPostClick={handlePostClick}
                onLikeToggle={(id, e) => {
                  e.stopPropagation();
                  handleLikeToggle(id);
                }}
                onFollowToggle={() => { }}
                onEditProfileClick={() => setIsEditProfileOpen(true)}
                isOwnProfile={true}
                theme={theme}
              />
            ) : (
              /* Viewing external creator */
              currentCreator && (
                <CreatorProfile
                  user={{
                    ...currentCreator,
                    userFollowersCount: userFollowCounts[currentCreator.id] || currentCreator.userFollowersCount,
                  }}
                  posts={posts.filter((p) => p.userId === currentCreator.id)}
                  onPostClick={handlePostClick}
                  onLikeToggle={(id, e) => {
                    e.stopPropagation();
                    handleLikeToggle(id);
                  }}
                  onFollowToggle={(userId) => handleFollowToggle(userId)}
                  isOwnProfile={false}
                  theme={theme}
                />
              )
            )}
          </div>
        )}
      </main>

      {/* Floating Bottom Nav for Mobile Only */}
      <div className="md:hidden">
        <BottomNav
          currentTab={activeTab === "search" ? "home" : activeTab} // Bottom nav typically just uses home/profile
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === "home") {
              setSelectedCreatorId(null);
            } else {
              setSelectedCreatorId(activeUser?.id || "user_active");
            }
          }}
          onUploadClick={() => requireAuth(() => setIsUploadOpen(true))}
          onNotificationsClick={() => addToast("Notifications coming soon!", "info")}
          activeUser={activeUser}
        />
      </div>

      {/* Detail Overlay Modal */}
      <AnimatePresence>
        {selectedPost && (
          <PostDetailModal
            post={selectedPost}
            allPosts={posts}
            onClose={() => setSelectedPost(null)}
            onLikeToggle={handleLikeToggle}
            onFollowToggle={handleFollowToggle}
            activeUser={activeUser}
            onAddComment={handleAddComment}
            onDownloadClick={handleDownload}
            onDeletePost={handleDeletePost}
            onEditPost={handleEditPost}
          />
        )}
      </AnimatePresence>

      {/* Creation Modal */}
      <AnimatePresence>
        {isUploadOpen && (
          <UploadModal
            onClose={() => setIsUploadOpen(false)}
            onUploadSuccess={handleUploadSuccess}
            activeUser={activeUser}
          />
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user) => {
          setActiveUser(user);
          // Set active view to profile after logging in if they were clicking profile
          if (activeTab === "profile") {
            setSelectedCreatorId(user.id);
          }
        }}
      />

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditProfileOpen && (
          <EditProfileModal
            user={activeUser}
            onClose={() => setIsEditProfileOpen(false)}
            onSave={handleSaveProfile}
          />
        )}
      </AnimatePresence>
      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal
            activeUser={activeUser}
            theme={theme}
            onClose={() => setIsSettingsOpen(false)}
            onThemeToggle={() => setTheme(t => t === "dark" ? "light" : "dark")}
            onEditProfile={() => setIsEditProfileOpen(true)}
            onLogout={handleLogout}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
