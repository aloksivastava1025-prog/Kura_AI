"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Globe, Shield, Download, Heart, MessageSquare } from "lucide-react";
import { signInWithGoogle } from "@/lib/firebase";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { addToast } = useToast();

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      // 1. Trigger Google popup via Firebase
      const authResult = await signInWithGoogle();
      
      // 2. Exchange token with backend MongoDB session
      const backendRes = await api.loginWithGoogle(authResult.idToken, authResult.user);
      
      if (backendRes.token && backendRes.user) {
        localStorage.setItem("pin_ai_token", backendRes.token);
        
        // Map user profile to page.tsx structure
        const mappedUser = {
          id: backendRes.user.id || backendRes.user._id,
          userName: backendRes.user.userName,
          userHandle: backendRes.user.userHandle,
          userAvatar: backendRes.user.avatar,
          userFollowersCount: backendRes.user.followersCount || 0,
          userFollowingCount: backendRes.user.followingCount || 0,
          userBio: backendRes.user.bio || "",
        };

        addToast(`Welcome back, ${mappedUser.userName}!`, "success");
        onSuccess(mappedUser);
        onClose();
      } else {
        throw new Error("Authentication failed on the server.");
      }
    } catch (err: any) {
      console.error(err);
      addToast(err.message || "Failed to log in with Google.", "error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          {/* Close Overlay */}
          <div className="absolute inset-0 cursor-default" onClick={onClose} />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[440px] bg-white/80 backdrop-blur-lg border border-white/20 rounded-card p-6 md:p-8 flex flex-col items-center text-center shadow-2xl relative z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 hover:bg-black/5 rounded-full border border-transparent hover:border-gray-200 text-gray-500 hover:text-orange-primary hover:scale-105 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Premium Icon Badge */}
            <div className="w-12 h-12 rounded-full bg-orange-primary/10 border border-orange-primary/20 flex items-center justify-center text-orange-primary mb-6 animate-pulse">
              <Sparkles className="w-5 h-5 fill-orange-primary/10" strokeWidth={2} />
            </div>

            {/* Headings */}
            <h2 className="font-display font-black text-2xl text-[#111] leading-tight mb-2 tracking-tight">
              Unlock the Full Recipe
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed max-w-[320px] mb-8">
              Join the creative playground. Save prompts, share your high-res design masterpieces, and discuss setups.
            </p>

            {/* Feature Perks List */}
            <div className="w-full flex flex-col gap-3.5 mb-8 text-left bg-gray-50/50 border border-gray-100 p-4 rounded-xl">
              <div className="flex items-start gap-3">
                <Download className="w-4.5 h-4.5 text-orange-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-gray-800">High-Resolution Downloads</h4>
                  <p className="text-[10px] text-gray-500">Instantly grab clean source files and raw outputs.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Heart className="w-4.5 h-4.5 text-orange-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Community Interaction</h4>
                  <p className="text-[10px] text-gray-500">Like, follow, and comment on other creative projects.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageSquare className="w-4.5 h-4.5 text-orange-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Share AI Style Prompts</h4>
                  <p className="text-[10px] text-gray-500">Copy recipes and publish your own generations to your portfolio.</p>
                </div>
              </div>
            </div>

            {/* Google Sign-in Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoggingIn}
              onClick={handleGoogleLogin}
              className={`w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl font-sans font-bold text-sm border shadow-sm transition-all ${
                isLoggingIn
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {isLoggingIn ? (
                <div className="w-5 h-5 rounded-full border-2 border-orange-primary border-t-transparent animate-spin" />
              ) : (
                <Globe className="w-5 h-5 text-[#4285F4]" />
              )}
              <span>{isLoggingIn ? "Logging in..." : "Continue with Google"}</span>
            </motion.button>

            {/* Secure Footer */}
            <div className="flex items-center gap-1.5 mt-6 text-[10px] text-gray-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Secure authentication powered by Firebase Auth</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
