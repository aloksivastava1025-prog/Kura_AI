"use client";

import { motion } from "framer-motion";
import { X, Moon, Sun, LogOut, User as UserIcon, Monitor } from "lucide-react";
import { User } from "@/lib/types";

interface SettingsModalProps {
  onClose: () => void;
  activeUser: User | null;
  theme: "dark" | "light";
  onThemeToggle: () => void;
  onLogout: () => void;
  onEditProfile: () => void;
}

export default function SettingsModal({
  onClose,
  activeUser,
  theme,
  onThemeToggle,
  onLogout,
  onEditProfile,
}: SettingsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className={`w-full max-w-md rounded-2xl overflow-hidden relative z-10 shadow-2xl border ${
          theme === "dark" 
            ? "bg-[#111111] border-white/10" 
            : "bg-white border-gray-200"
        }`}
      >
        <div className={`p-5 flex justify-between items-center border-b ${
          theme === "dark" ? "border-white/10" : "border-gray-100"
        }`}>
          <h2 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Settings
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              theme === "dark"
                ? "text-gray-400 hover:text-white hover:bg-white/10"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-2">
          {/* Theme Section */}
          <div className="p-3">
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${
              theme === "dark" ? "text-gray-500" : "text-gray-400"
            }`}>
              Appearance
            </h3>
            <button
              onClick={onThemeToggle}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                theme === "dark" 
                  ? "hover:bg-white/5 text-gray-300" 
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span className="font-medium">
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </span>
              </div>
            </button>
          </div>

          {activeUser && (
            <>
              <div className={`h-px w-full my-2 ${theme === "dark" ? "bg-white/5" : "bg-gray-100"}`} />
              
              {/* Account Section */}
              <div className="p-3">
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${
                  theme === "dark" ? "text-gray-500" : "text-gray-400"
                }`}>
                  Account
                </h3>
                <button
                  onClick={() => {
                    onClose();
                    onEditProfile();
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors mb-1 ${
                    theme === "dark" 
                      ? "hover:bg-white/5 text-gray-300" 
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="font-medium">Edit Profile</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    theme === "dark" 
                      ? "hover:bg-red-500/10 text-red-400" 
                      : "hover:bg-red-50 text-red-600"
                  }`}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
