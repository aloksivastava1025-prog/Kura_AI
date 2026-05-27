"use client";

import { 
  Search, Plus, Grid, Sliders, Sparkles, Home, User, Settings, 
  LayoutGrid, Image as ImageIcon, Paintbrush, Archive, TrendingUp,
  ChevronLeft, ChevronRight, Sun, Moon, Flame
} from "lucide-react";

interface SidebarProps {
  currentView: "grid" | "scroll";
  setCurrentView: (view: "grid" | "scroll") => void;
  onUploadClick: () => void;
  onProfileClick: () => void;
  onSettingsClick: () => void;
  activeUser: { userName: string; userHandle: string; userAvatar?: string } | null;
  onHomeClick: () => void;
  currentTab: "home" | "profile" | "search";
  onTabChange: (tab: "home" | "profile" | "search") => void;

  activeCategory: string;
  setActiveCategory: (cat: any) => void;
  postCounts: { [key: string]: number };

  isCollapsed: boolean;
  onToggleCollapse: () => void;
  
  theme: "dark" | "light";
  onThemeToggle: () => void;

  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  currentView,
  setCurrentView,
  onUploadClick,
  onProfileClick,
  activeUser,
  onHomeClick,
  currentTab,
  onTabChange,
  activeCategory,
  setActiveCategory,
  postCounts,
  isCollapsed,
  onToggleCollapse,
  theme,
  onThemeToggle,
  onSettingsClick,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  
  // Removed dynamic style helper functions to ensure static compilation with Tailwind v4

  // Reusable helper to style category badge counts dynamically across themes
  const getBadgeStyles = () => {
    return `text-[10px] px-2 py-0.5 rounded-[4px] border transition-colors ${
      theme === "dark"
        ? "text-[#8E8E93] bg-[#1A1A1C] border-[#2A2A2E]"
        : "text-gray-500 bg-gray-100 border-gray-200/80"
    }`;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] md:hidden transition-opacity duration-300"
          onClick={onCloseMobile}
        />
      )}
      
      <aside className={`fixed left-0 top-0 h-screen border-r z-[60] md:z-50 flex flex-col transition-all duration-300 ease-in-out select-none overflow-visible ${
        theme === "dark" ? "bg-[#0B0B0C] border-[#1C1C1F]" : "bg-[#FDFDFD] border-[#E5E7EB]"
      } ${
        isMobileOpen ? "translate-x-0 w-[280px]" : "-translate-x-full md:translate-x-0"
      } ${
        !isMobileOpen && isCollapsed ? "md:w-[80px]" : "md:w-[280px]"
      }`}>
      
      {/* Collapse Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className={`absolute top-6 -right-3 w-6 h-6 rounded-[4px] flex items-center justify-center shadow-md z-50 transition-all hover:scale-105 border ${
          theme === "dark" 
            ? "bg-[#0E0E10] border-[#222226] text-[#8E8E93] hover:text-white hover:border-[#333339]" 
            : "bg-white border-[#E5E7EB] text-gray-400 hover:text-gray-900 hover:border-gray-300"
        }`}
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Scrollable Inner container */}
      <div className={`flex-1 flex flex-col overflow-y-auto overflow-x-hidden no-scrollbar py-6 transition-all duration-300 relative ${
        isCollapsed ? "px-2 items-center" : "px-4"
      }`}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => {
            onHomeClick();
            onTabChange("home");
          }}
          className={`flex items-center mb-10 cursor-pointer hover:opacity-90 transition-all duration-300 w-full ${
            isCollapsed ? "justify-center" : "px-2 py-1 gap-1"
          }`}
        >
          <div className={`flex items-center justify-center shrink-0 transition-all duration-300 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>
            <span className="font-display font-black text-[32px] leading-none">K</span>
          </div>
          {!isCollapsed && (
            <span className={`font-sans font-extrabold text-[28px] tracking-tighter animate-fade-in whitespace-nowrap ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              ura<span className="text-orange-primary text-4xl leading-[0] relative top-[3px]">.</span>
            </span>
          )}
        </div>

        {/* Main Navigation */}
        <div className={`flex flex-col gap-2 mb-8 animate-fade-in w-full ${isCollapsed ? "items-center" : ""}`}>
          {/* Home Feed */}
          <button
            onClick={() => {
              onHomeClick();
              onTabChange("home");
            }}
            className={`flex flex-row items-center transition-all ${
              isCollapsed 
                ? "justify-center w-12 h-12 rounded-[6px] self-center" 
                : "gap-3 px-4 py-3.5 rounded-[6px] font-bold text-sm w-full text-left"
            } ${
              currentTab === "home"
                ? theme === "dark"
                  ? "bg-[#1E1E21] text-white border border-[#2D2D31] shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                  : "bg-white text-gray-900 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
                : theme === "dark"
                  ? "text-[#8E8E93] hover:bg-[#151517] hover:text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            }`}
            title={isCollapsed ? "Home Feed" : undefined}
          >
            <Home className="w-[18px] h-[18px] shrink-0" strokeWidth={currentTab === "home" ? 2.5 : 2} />
            {!isCollapsed && <span className="whitespace-nowrap animate-fade-in">Home Feed</span>}
          </button>

          {/* Discovery */}
          <button
            onClick={() => onTabChange("search")}
            className={`flex flex-row items-center transition-all ${
              isCollapsed 
                ? "justify-center w-12 h-12 rounded-[6px] self-center" 
                : "gap-3 px-4 py-3.5 rounded-[6px] font-bold text-sm w-full text-left"
            } ${
              currentTab === "search"
                ? theme === "dark"
                  ? "bg-[#1E1E21] text-white border border-[#2D2D31] shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                  : "bg-white text-gray-900 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
                : theme === "dark"
                  ? "text-[#8E8E93] hover:bg-[#151517] hover:text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            }`}
            title={isCollapsed ? "Discovery" : undefined}
          >
            <TrendingUp className="w-[18px] h-[18px] shrink-0" strokeWidth={currentTab === "search" ? 2.5 : 2} />
            {!isCollapsed && <span className="whitespace-nowrap animate-fade-in">Discovery</span>}
          </button>

          {/* My Profile */}
          <button
            onClick={() => {
              onProfileClick();
              onTabChange("profile");
            }}
            className={`flex flex-row items-center transition-all ${
              isCollapsed 
                ? "justify-center w-12 h-12 rounded-[6px] self-center" 
                : "gap-3 px-4 py-3.5 rounded-[6px] font-bold text-sm w-full text-left"
            } ${
              currentTab === "profile"
                ? theme === "dark"
                  ? "bg-[#1E1E21] text-white border border-[#2D2D31] shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                  : "bg-white text-gray-900 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
                : theme === "dark"
                  ? "text-[#8E8E93] hover:bg-[#151517] hover:text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            }`}
            title={isCollapsed ? "My Profile" : undefined}
          >
            <User className="w-[18px] h-[18px] shrink-0" strokeWidth={currentTab === "profile" ? 2.5 : 2} />
            {!isCollapsed && <span className="whitespace-nowrap animate-fade-in">My Profile</span>}
          </button>
        </div>

        {/* Create Button */}
        <button
          onClick={onUploadClick}
          className={`flex items-center justify-center gap-2 mb-8 bg-orange-primary text-white hover:bg-orange-hover transition-colors shrink-0 ${
            isCollapsed ? "w-12 h-12 rounded-[6px]" : "w-full py-3.5 rounded-[6px] font-black text-sm"
          }`}
          title={isCollapsed ? "Create Post" : undefined}
        >
          <Plus className="w-5 h-5 shrink-0" strokeWidth={2.5} />
          {!isCollapsed && <span className="animate-fade-in whitespace-nowrap">Create Post</span>}
        </button>

        {/* Categories / Filters */}
        {(currentTab === "home" || currentTab === "search") && (
          <div className={`flex flex-col w-full flex-1 animate-fade-in gap-3 ${isCollapsed ? "items-center" : ""}`}>
            {!isCollapsed && (
              <h3 className={`text-[10px] font-black uppercase tracking-widest px-1.5 ${
                theme === "dark" ? "text-white/30" : "text-gray-400"
              }`}>
                Categories
              </h3>
            )}
            
            <div className={`flex flex-col gap-1.5 w-full ${isCollapsed ? "items-center" : ""}`}>
              {/* All Posts */}
              <button
                onClick={() => setActiveCategory("all")}
                className={`flex flex-row items-center transition-all ${
                  isCollapsed 
                    ? "justify-center w-12 h-12 rounded-[6px] self-center" 
                    : "justify-between px-4 py-2.5 rounded-[6px] text-[13px] font-bold w-full text-left"
                } ${
                  activeCategory === "all"
                    ? theme === "dark"
                      ? "bg-[#1E1E21] text-white border border-[#2D2D31] shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                      : "bg-white text-gray-900 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
                    : theme === "dark"
                      ? "text-[#8E8E93] hover:bg-[#151517] hover:text-white"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
                title={isCollapsed ? "All Posts" : undefined}
              >
                {isCollapsed ? (
                  <Grid className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
                ) : (
                  <>
                    <div className="flex flex-row items-center gap-3">
                      <Grid className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
                      <span className="whitespace-nowrap animate-fade-in">All Posts</span>
                    </div>
                    <span className={getBadgeStyles()}>{postCounts.all || 0}</span>
                  </>
                )}
              </button>

              {/* Rising Stars */}
              <button
                onClick={() => setActiveCategory("rising_stars")}
                className={`flex flex-row items-center transition-all ${
                  isCollapsed 
                    ? "justify-center w-12 h-12 rounded-[6px] self-center" 
                    : "justify-between px-4 py-2.5 rounded-[6px] text-[13px] font-bold w-full text-left"
                } ${
                  activeCategory === "rising_stars"
                    ? theme === "dark"
                      ? "bg-[#1E1E21] text-white border border-[#2D2D31] shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                      : "bg-white text-gray-900 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
                    : theme === "dark"
                      ? "text-[#8E8E93] hover:bg-[#151517] hover:text-white"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
                title={isCollapsed ? "Rising Stars" : undefined}
              >
                {isCollapsed ? (
                  <Flame className="w-[18px] h-[18px] shrink-0 text-orange-primary" strokeWidth={2} />
                ) : (
                  <div className="flex flex-row items-center gap-3">
                    <Flame className="w-[18px] h-[18px] shrink-0 text-orange-primary" strokeWidth={2} />
                    <span className="whitespace-nowrap animate-fade-in text-orange-primary">Rising Stars</span>
                  </div>
                )}
              </button>

              {/* AI Generated */}
              <button
                onClick={() => setActiveCategory("ai_art")}
                className={`flex flex-row items-center transition-all ${
                  isCollapsed 
                    ? "justify-center w-12 h-12 rounded-[6px] self-center" 
                    : "justify-between px-4 py-2.5 rounded-[6px] text-[13px] font-bold w-full text-left"
                } ${
                  activeCategory === "ai_art"
                    ? theme === "dark"
                      ? "bg-[#1E1E21] text-white border border-[#2D2D31] shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                      : "bg-white text-gray-900 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
                    : theme === "dark"
                      ? "text-[#8E8E93] hover:bg-[#151517] hover:text-white"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
                title={isCollapsed ? "AI Generated" : undefined}
              >
                {isCollapsed ? (
                  <Sparkles className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
                ) : (
                  <>
                    <div className="flex flex-row items-center gap-3">
                      <Sparkles className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
                      <span className="whitespace-nowrap animate-fade-in">AI Generated</span>
                    </div>
                    <span className={getBadgeStyles()}>{postCounts.ai_art || 0}</span>
                  </>
                )}
              </button>

              {/* Photography */}
              <button
                onClick={() => setActiveCategory("photography")}
                className={`flex flex-row items-center transition-all ${
                  isCollapsed 
                    ? "justify-center w-12 h-12 rounded-[6px] self-center" 
                    : "justify-between px-4 py-2.5 rounded-[6px] text-[13px] font-bold w-full text-left"
                } ${
                  activeCategory === "photography"
                    ? theme === "dark"
                      ? "bg-[#1E1E21] text-white border border-[#2D2D31] shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                      : "bg-white text-gray-900 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
                    : theme === "dark"
                      ? "text-[#8E8E93] hover:bg-[#151517] hover:text-white"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
                title={isCollapsed ? "Photography" : undefined}
              >
                {isCollapsed ? (
                  <ImageIcon className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
                ) : (
                  <>
                    <div className="flex flex-row items-center gap-3">
                      <ImageIcon className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
                      <span className="whitespace-nowrap animate-fade-in">Photography</span>
                    </div>
                    <span className={getBadgeStyles()}>{postCounts.photography || 0}</span>
                  </>
                )}
              </button>

              {/* Design */}
              <button
                onClick={() => setActiveCategory("design")}
                className={`flex flex-row items-center transition-all ${
                  isCollapsed 
                    ? "justify-center w-12 h-12 rounded-[6px] self-center" 
                    : "justify-between px-4 py-2.5 rounded-[6px] text-[13px] font-bold w-full text-left"
                } ${
                  activeCategory === "design"
                    ? theme === "dark"
                      ? "bg-[#1E1E21] text-white border border-[#2D2D31] shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                      : "bg-white text-gray-900 border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
                    : theme === "dark"
                      ? "text-[#8E8E93] hover:bg-[#151517] hover:text-white"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
                title={isCollapsed ? "Design" : undefined}
              >
                {isCollapsed ? (
                  <Paintbrush className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
                ) : (
                  <>
                    <div className="flex flex-row items-center gap-3">
                      <Paintbrush className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
                      <span className="whitespace-nowrap animate-fade-in">Design</span>
                    </div>
                    <span className={getBadgeStyles()}>{postCounts.design || 0}</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="flex-1"></div>

            {/* View Mode Toggle */}
            <div className={`p-1 rounded-[6px] flex select-none mt-6 w-full border transition-all ${
              theme === "dark" ? "bg-[#131315] border-[#1C1C1E]" : "bg-gray-100 border-gray-200/60"
            } ${
              isCollapsed ? "flex-col gap-1 w-12 self-center" : "items-center"
            }`}>
              <button
                onClick={() => setCurrentView("grid")}
                className={`flex justify-center items-center rounded-[4px] text-[12px] font-bold transition-all relative z-10 ${
                  isCollapsed ? "w-10 h-10" : "flex-1 py-2.5 gap-2"
                } ${
                  currentView === "grid" 
                    ? (theme === "dark" 
                        ? "text-white bg-[#1E1E21] border border-[#2D2D31] shadow-md" 
                        : "text-gray-900 bg-white border border-gray-200/80 shadow-md")
                    : (theme === "dark" 
                        ? "text-[#8E8E93] hover:text-white" 
                        : "text-gray-400 hover:text-gray-900")
                }`}
                title={isCollapsed ? "Grid View" : undefined}
              >
                <LayoutGrid className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Grid</span>}
              </button>

              <button
                onClick={() => setCurrentView("scroll")}
                className={`flex justify-center items-center rounded-[4px] text-[12px] font-bold transition-all relative z-10 ${
                  isCollapsed ? "w-10 h-10" : "flex-1 py-2.5 gap-2"
                } ${
                  currentView === "scroll" 
                    ? (theme === "dark" 
                        ? "text-white bg-[#1E1E21] border border-[#2D2D31] shadow-md" 
                        : "text-gray-900 bg-white border border-gray-200/80 shadow-md")
                    : (theme === "dark" 
                        ? "text-[#8E8E93] hover:text-white" 
                        : "text-gray-400 hover:text-gray-900")
                }`}
                title={isCollapsed ? "Scroll View" : undefined}
              >
                <Sliders className="w-4 h-4 rotate-90 shrink-0" />
                {!isCollapsed && <span>Scroll</span>}
              </button>
            </div>
          </div>
        )}

        {currentTab === "profile" && <div className="flex-1"></div>}
      </div>

      {/* User Area & Settings - Anchored fixed at bottom */}
      <div className={`pt-4 border-t flex flex-col gap-3 shrink-0 z-20 transition-all duration-300 w-full ${
        theme === "dark" ? "border-[#1C1C1F] bg-[#0B0B0C]" : "border-[#E5E7EB] bg-[#FDFDFD]"
      } ${
        isCollapsed ? "pb-6 px-2 items-center" : "pb-6 px-5"
      }`}>
        
        {/* Theme Toggle Button */}
        <button 
          onClick={onThemeToggle}
          className={`flex flex-row items-center transition-all ${
            isCollapsed 
              ? "justify-center w-12 h-12 rounded-[6px] self-center animate-fade-in" 
              : "gap-3 px-4 py-3 rounded-[6px] font-bold text-sm w-full text-left animate-fade-in"
          } ${
            theme === "dark"
              ? "text-[#8E8E93] hover:bg-[#151517] hover:text-white"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          }`}
          title={isCollapsed ? `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode` : undefined}
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-[18px] h-[18px] text-orange-primary shrink-0 animate-fade-in" strokeWidth={2} />
              {!isCollapsed && <span className="whitespace-nowrap animate-fade-in">Light Theme</span>}
            </>
          ) : (
            <>
              <Moon className="w-[18px] h-[18px] text-blue-600 shrink-0 animate-fade-in" strokeWidth={2} />
              {!isCollapsed && <span className="whitespace-nowrap animate-fade-in">Dark Theme</span>}
            </>
          )}
        </button>

        {/* Settings button */}
        <button 
          onClick={onSettingsClick}
          className={`flex flex-row items-center transition-all ${
            isCollapsed 
              ? "justify-center w-12 h-12 rounded-[6px] self-center" 
              : "gap-3 px-4 py-3 rounded-[6px] font-bold text-sm w-full text-left"
          } ${
            theme === "dark"
              ? "text-[#8E8E93] hover:bg-[#151517] hover:text-white"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          }`}
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings className={`w-[18px] h-[18px] shrink-0 transition-colors ${
            theme === "dark" ? "text-[#8E8E93]" : "text-gray-500"
          }`} strokeWidth={2} />
          {!isCollapsed && <span className="animate-fade-in whitespace-nowrap">Settings</span>}
        </button>

        {activeUser ? (
          <button 
            onClick={() => {
              onProfileClick();
              onTabChange("profile");
            }}
            className={`flex flex-row items-center cursor-pointer transition-all border ${
              isCollapsed 
                ? `justify-center w-12 h-12 rounded-[6px] self-center ${
                    theme === "dark" 
                      ? "bg-[#131315] border-[#222226] shadow-md" 
                      : "bg-[#F3F4F6] border-gray-200 shadow-[0_2px_6px_rgba(0,0,0,0.02)]"
                  }` 
                : `gap-3 px-3 py-2 w-full rounded-[6px] text-left ${
                    theme === "dark" 
                      ? "bg-[#131315] border-[#1C1C1E] hover:border-[#222226] hover:bg-[#18181A]" 
                      : "bg-[#F3F4F6] border-gray-200/80 hover:border-gray-300 hover:bg-gray-100/80 shadow-[0_2px_6px_rgba(0,0,0,0.02)]"
                  }`
            }`}
            title={isCollapsed ? `${activeUser.userName} (@${activeUser.userHandle})` : undefined}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-primary to-[#2B5BFF] flex items-center justify-center overflow-hidden shrink-0">
              {activeUser.userAvatar ? (
                <img src={activeUser.userAvatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-xs font-black">{activeUser.userName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 animate-fade-in">
                <span className={`text-xs font-black truncate whitespace-nowrap ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>{activeUser.userName}</span>
                <span className={`text-[10px] truncate whitespace-nowrap ${
                  theme === "dark" ? "text-[#8E8E93]" : "text-gray-500"
                }`}>@{activeUser.userHandle}</span>
              </div>
            )}
          </button>
        ) : (
          <button 
            onClick={onProfileClick}
            className={`flex flex-row items-center justify-center transition-all font-black border ${
              isCollapsed ? "w-12 h-12 rounded-[6px] self-center" : "w-full py-3 mt-1 rounded-[6px] text-sm text-center"
            } ${
              theme === "dark"
                ? "bg-white hover:bg-white/90 text-black border-white"
                : "bg-gray-900 hover:bg-gray-800 text-white border-gray-900"
            }`}
            title={isCollapsed ? "Log In" : undefined}
          >
            {isCollapsed ? <User className="w-[18px] h-[18px] shrink-0" /> : <span className="animate-fade-in whitespace-nowrap text-center w-full">Log In</span>}
          </button>
        )}
      </div>

    </aside>
    </>
  );
}
