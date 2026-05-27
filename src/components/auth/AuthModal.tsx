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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          {/* Close Overlay */}
          <div className="absolute inset-0 cursor-default" onClick={onClose} />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[440px] bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[24px] p-6 md:p-8 flex flex-col items-center text-center shadow-[0_0_80px_rgba(0,0,0,0.8)] relative z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-white/10 rounded-full border border-white/5 hover:border-white/20 text-white/50 hover:text-white hover:scale-105 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Premium Icon Badge */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/10 flex items-center justify-center text-orange-primary mb-6 shadow-[0_0_30px_rgba(255,107,0,0.15)]">
              <Sparkles className="w-6 h-6 fill-orange-primary/20" strokeWidth={1.5} />
            </div>

            {/* Headings */}
            <h2 className="font-display font-black text-3xl text-white leading-tight mb-2 tracking-tight">
              Unlock the Full Recipe
            </h2>
            <p className="text-sm text-white/60 leading-relaxed max-w-[320px] mb-8">
              Join the creative playground. Save prompts, share your high-res design masterpieces, and discuss setups.
            </p>

            {/* Feature Perks List */}
            <div className="w-full flex flex-col gap-4 mb-8 text-left bg-white/[0.03] border border-white/5 p-5 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="bg-orange-primary/10 p-2 rounded-lg mt-0.5">
                  <Download className="w-4 h-4 text-orange-primary shrink-0" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white/90">High-Resolution Downloads</h4>
                  <p className="text-[11px] text-white/50 leading-relaxed mt-0.5">Instantly grab clean source files and raw outputs.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-orange-primary/10 p-2 rounded-lg mt-0.5">
                  <Heart className="w-4 h-4 text-orange-primary shrink-0" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white/90">Community Interaction</h4>
                  <p className="text-[11px] text-white/50 leading-relaxed mt-0.5">Like, follow, and comment on other creative projects.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-orange-primary/10 p-2 rounded-lg mt-0.5">
                  <MessageSquare className="w-4 h-4 text-orange-primary shrink-0" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white/90">Share AI Style Prompts</h4>
                  <p className="text-[11px] text-white/50 leading-relaxed mt-0.5">Copy recipes and publish your own generations to your portfolio.</p>
                </div>
              </div>
            </div>

            {/* Google Sign-in Button */}
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoggingIn}
              onClick={handleGoogleLogin}
              className={`w-full flex items-center justify-center gap-3 py-4 px-4 rounded-xl font-sans font-bold text-sm border shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all ${
                isLoggingIn
                  ? "bg-white/5 text-white/30 border-white/5 cursor-not-allowed"
                  : "bg-white/5 text-white border-white/10 hover:border-white/20"
              }`}
            >
              {isLoggingIn ? (
                <div className="w-5 h-5 rounded-full border-2 border-orange-primary border-t-transparent animate-spin" />
              ) : (
                <Globe className="w-5 h-5 text-white/80" />
              )}
              <span>{isLoggingIn ? "Authenticating..." : "Continue with Google"}</span>
            </motion.button>

            {/* Secure Footer */}
            <div className="flex items-center gap-1.5 mt-6 text-[10px] text-white/30 tracking-wide uppercase font-bold">
              <Shield className="w-3.5 h-3.5" />
              <span>Secure authentication via Firebase</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
