"use client";

import { Home, Search, Plus, Bell, User } from "lucide-react";

interface BottomNavProps {
  currentTab: "home" | "profile";
  onTabChange: (tab: "home" | "profile") => void;
  onUploadClick: () => void;
  activeUser: { userName: string } | null;
}

export default function BottomNav({
  currentTab,
  onTabChange,
  onUploadClick,
  activeUser,
}: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/85 dark:bg-[#0B0B0C]/85 backdrop-blur-xl border-t border-gray-200/50 dark:border-white/10 flex items-center justify-around pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] px-6 transition-colors duration-300">
      
      <button
        onClick={() => onTabChange("home")}
        className={`p-2 rounded-full transition-all duration-300 ${
          currentTab === "home" ? "text-black dark:text-white" : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        }`}
      >
        <Home className={`w-[26px] h-[26px] transition-all duration-300 ${currentTab === "home" ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
      </button>

      <button
        onClick={() => onTabChange("search" as any)}
        className={`p-2 rounded-full transition-all duration-300 ${
          currentTab === ("search" as any) ? "text-black dark:text-white" : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        }`}
      >
        <Search className={`w-[26px] h-[26px] transition-all duration-300 ${currentTab === ("search" as any) ? "stroke-[3px]" : "stroke-[2px]"}`} />
      </button>

      {/* Center Upload Button - Sleek and modern */}
      <button
        onClick={onUploadClick}
        className="group flex items-center justify-center w-12 h-9 rounded-[10px] bg-black dark:bg-white text-white dark:text-black shadow-md hover:scale-105 active:scale-95 transition-all duration-300"
      >
        <Plus className="w-5 h-5 stroke-[2.5px]" />
      </button>

      <button
        className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-all duration-300 relative"
      >
        <Bell className="w-[26px] h-[26px] stroke-[2px]" />
        <span className="absolute top-[9px] right-[9px] w-2 h-2 bg-red-500 border-2 border-white dark:border-[#0B0B0C] rounded-full" />
      </button>

      <button
        onClick={() => onTabChange("profile")}
        className={`p-0.5 rounded-full transition-all duration-300 border-2 ${
          currentTab === "profile" 
            ? "border-black dark:border-white scale-105" 
            : "border-transparent opacity-80 hover:opacity-100"
        }`}
      >
        <div className={`w-[26px] h-[26px] rounded-full flex items-center justify-center font-sans text-[11px] font-bold tracking-tight ${
          currentTab === "profile"
            ? "bg-black dark:bg-white text-white dark:text-black"
            : "bg-gray-200 dark:bg-[#222] text-gray-600 dark:text-gray-400"
        }`}>
          {activeUser?.userName ? activeUser.userName.charAt(0).toUpperCase() : "U"}
        </div>
      </button>
    </nav>
  );
}
