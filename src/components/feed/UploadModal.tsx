"use client";

import { useState } from "react";
import { X, Sparkles, Image as ImageIcon, Plus, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Post } from "@/lib/types";
import { api } from "@/lib/api";

interface UploadModalProps {
  onClose: () => void;
  onUploadSuccess: (newPost: Omit<Post, "id" | "createdAt" | "likeCount" | "commentCount" | "viewCount" | "comments" | "isLiked" | "isFollowing"> & { id: string }) => void;
  activeUser: { userName: string; userHandle: string };
}

export default function UploadModal({
  onClose,
  onUploadSuccess,
  activeUser,
}: UploadModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState<"ai_art" | "photography" | "design" | "illustration">("ai_art");
  const [tagsText, setTagsText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showAiMetadata, setShowAiMetadata] = useState(false);
  
  // AI Metadata fields
  const [aiEngine, setAiEngine] = useState<"Midjourney" | "DALL·E 3" | "Adobe Firefly" | "Stable Diffusion" | "Other">("Midjourney");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiStyle, setAiStyle] = useState("");
  const [aiAspectRatio, setAiAspectRatio] = useState("16:9");

  // Mock upload logic (allows paste URL or select a mock pre-generated asset for simplicity)
  const [mockAssetSelected, setMockAssetSelected] = useState<string | null>(null);

  const mockPreloadedAssets = [
    { name: "Neon Oasis", url: "/images/neon_oasis.png" },
    { name: "Minimal Clay", url: "/images/minimal_clay.png" },
    { name: "Holographic Dreams", url: "/images/holo_dreams.png" },
    { name: "Botanical Harmony", url: "/images/botanical_harmony.png" },
    { name: "Eternal Archive", url: "/images/eternal_archive.png" },
    { name: "Desert Monolith", url: "/images/desert_monolith.png" }
  ];

  const [isUploading, setIsUploading] = useState(false);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsUploading(true);
    let finalImageUrl = mockAssetSelected || imageUrl || "/images/neon_oasis.png";

    try {
      // If the preview is a base64 string, upload it to the server first
      if (finalImageUrl.startsWith("data:image")) {
        const uploadData = await api.uploadImage(finalImageUrl);
        if (uploadData.url) {
          finalImageUrl = uploadData.url;
        }
      }

      const parsedTags = tagsText
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // Intelligently calculate bento grid size based on actual image dimensions
      const getBentoSize = (url: string): Promise<"small" | "tall" | "wide" | "large"> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const ratio = img.width / img.height;
            // If much wider than tall -> wide (span 2 cols, 1 row)
            if (ratio > 1.2) resolve("wide");
            // If much taller than wide -> tall (span 1 col, 2 rows)
            else if (ratio < 0.8) resolve("tall");
            // If roughly square -> large (2x2) or small (1x1)
            else resolve(img.width > 800 ? "large" : "small");
          };
          img.onerror = () => resolve("large");
          img.src = url;
        });
      };

      const calculatedBentoSize = await getBentoSize(finalImageUrl);

      onUploadSuccess({
        id: `post-user-${Date.now()}`, // Temporary ID, backend will create real one
        title,
        description,
        contentType,
        imageUrls: [finalImageUrl],
        thumbnailUrl: finalImageUrl,
        tags: parsedTags.length > 0 ? parsedTags : ["Aesthetic", "Design"],
        isSensitive: false,
        userId: "user_active",
        userName: activeUser.userName,
        userHandle: activeUser.userHandle,
        userAvatar: "/avatars/active.jpg",
        userFollowersCount: 0,
        userFollowingCount: 0,
        bentoSize: calculatedBentoSize,
        
        // AI metadata
        ...(showAiMetadata ? {
          aiEngine,
          aiPrompt,
          aiStyle,
          aiAspectRatio
        } : {})
      });
      
      onClose();
    } catch (error) {
      console.error("Failed to publish post:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm">
      {/* Click outside close */}
      <div className="absolute inset-0 cursor-default hidden md:block" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3 }}
        className="bg-bg-card w-full h-[100dvh] md:max-w-4xl md:h-[80vh] rounded-none md:rounded-card overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row border-0 md:border border-gray-100"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full border border-gray-200 text-gray-500 hover:text-orange-primary transition-all shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Panel: Dropzone & Mock File Select */}
        <div className="w-full md:w-1/2 p-4 md:p-6 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50 md:h-full shrink-0">
          
          {/* Main Dropzone Box */}
          <div className="w-full h-32 md:flex-1 border-2 border-dashed border-gray-200 rounded-card flex flex-col items-center justify-center p-4 md:p-6 bg-white relative hover:border-orange-primary/45 transition-colors group cursor-pointer shrink-0">
            {/* Hidden File Input */}
            <input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setMockAssetSelected(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />

            {mockAssetSelected ? (
              <div className="absolute inset-0 p-2 flex items-center justify-center bg-white z-10">
                <img
                  src={mockAssetSelected}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain rounded-[6px]"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMockAssetSelected(null);
                  }}
                  className="absolute top-2 right-2 bg-black/75 text-white p-1 rounded-full hover:bg-black transition-colors z-30"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center flex flex-col items-center gap-2 select-none pointer-events-none">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-light flex items-center justify-center text-orange-primary transform group-hover:scale-105 transition-transform duration-200">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] md:text-xs font-bold text-txt-primary">Click to upload your photo</p>
                  <p className="text-[9px] md:text-[10px] text-gray-400 mt-0.5">JPG, PNG, GIF up to 10MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Selection grid for high-fidelity mock assets */}
          <div className="relative z-30 shrink-0">
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-txt-secondary block mb-2">
              Or Select Demo Asset
            </span>
            <div className="grid grid-cols-3 gap-2">
              {mockPreloadedAssets.map((asset) => (
                <button
                  type="button"
                  key={asset.name}
                  onClick={() => setMockAssetSelected(asset.url)}
                  className={`relative h-12 md:h-14 rounded-[6px] overflow-hidden border transition-all ${
                    mockAssetSelected === asset.url
                      ? "border-orange-primary ring-2 ring-orange-primary/20 scale-[0.98]"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                  {mockAssetSelected === asset.url && (
                    <div className="absolute inset-0 bg-orange-primary/30 flex items-center justify-center text-white">
                      <Check className="w-4 h-4 stroke-[3px]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Publishing Form */}
        <form onSubmit={handlePublish} className="md:w-1/2 flex-1 flex flex-col justify-between bg-white overflow-hidden text-gray-900">
          
          <div className="p-4 md:p-6 flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar">
            <h2 className="font-sans font-bold text-xl md:text-2xl text-txt-primary tracking-tight">
              Publish Creation
            </h2>

            {/* Title */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-txt-secondary">
                Title <span className="text-orange-primary">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give it an aesthetic name..."
                maxLength={100}
                className="w-full bg-white border border-gray-200 focus:border-orange-primary rounded-[8px] px-3 py-2 text-xs focus:outline-none transition-all"
              />
            </div>

            {/* The Recipe (Prompt) */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-txt-secondary">
                The Recipe (Prompt) <span className="text-orange-primary">*</span>
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Required. Paste your exact prompt here: e.g., 'A cinematic wide shot of...'"
                maxLength={1000}
                rows={4}
                className="w-full bg-white border border-gray-200 focus:border-orange-primary rounded-[8px] px-3 py-2 text-xs focus:outline-none transition-all resize-none"
              />
            </div>

            {/* Dual column: Content Type & Tags */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-txt-secondary">
                  Creative Medium
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as any)}
                  className="w-full bg-white border border-gray-200 focus:border-orange-primary rounded-[8px] px-3 py-2 text-xs focus:outline-none transition-all"
                >
                  <option value="ai_art">AI Art</option>
                  <option value="photography">Photography</option>
                  <option value="design">Digital Design</option>
                  <option value="illustration">Illustration</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-txt-secondary">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="3D Art, Minimalist, Clay"
                  className="w-full bg-white border border-gray-200 focus:border-orange-primary rounded-[8px] px-3 py-2 text-xs focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Preloaded Image URL input (Fallback) */}
            {!mockAssetSelected && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-txt-secondary">
                  Or Paste Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-white border border-gray-200 focus:border-orange-primary rounded-[8px] px-3 py-2 text-xs focus:outline-none transition-all"
                />
              </div>
            )}

            {/* AI Prompt Metadata Option */}
            <div className="border-t border-gray-100 pt-3.5 my-1">
              <button
                type="button"
                onClick={() => setShowAiMetadata(!showAiMetadata)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                  showAiMetadata
                    ? "bg-orange-light text-orange-primary border-orange-primary/20"
                    : "bg-white text-txt-secondary border-gray-200 hover:text-txt-primary"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Add AI prompt recipe</span>
              </button>

              {showAiMetadata && (
                <div className="mt-3.5 p-3.5 bg-orange-light/10 border border-orange-primary/10 rounded-card flex flex-col gap-3 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-orange-primary">
                        Synthesis Engine
                      </label>
                      <select
                        value={aiEngine}
                        onChange={(e) => setAiEngine(e.target.value as any)}
                        className="w-full bg-white border border-gray-200 focus:border-orange-primary rounded-[8px] px-2.5 py-1.5 text-xs focus:outline-none transition-all"
                      >
                        <option value="Midjourney">Midjourney</option>
                        <option value="DALL·E 3">DALL·E 3</option>
                        <option value="Adobe Firefly">Adobe Firefly</option>
                        <option value="Stable Diffusion">Stable Diffusion</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-orange-primary">
                        Aspect Ratio
                      </label>
                      <input
                        type="text"
                        value={aiAspectRatio}
                        onChange={(e) => setAiAspectRatio(e.target.value)}
                        placeholder="16:9, 4:5"
                        className="w-full bg-white border border-gray-200 focus:border-orange-primary rounded-[8px] px-2.5 py-1.5 text-xs focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-orange-primary">
                      Style Archetype
                    </label>
                    <input
                      type="text"
                      value={aiStyle}
                      onChange={(e) => setAiStyle(e.target.value)}
                      placeholder="Brutalist Render, Neon Cyberpunk"
                      className="w-full bg-white border border-gray-200 focus:border-orange-primary rounded-[8px] px-2.5 py-1.5 text-xs focus:outline-none transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-orange-primary">
                      Prompt Formula
                    </label>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="A cinema wide shot of brutalist columns --ar 16:9"
                      rows={2}
                      className="w-full bg-white border border-gray-200 focus:border-orange-primary rounded-[8px] px-2.5 py-1.5 text-xs focus:outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Form Actions */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-2 sticky bottom-0 z-10 backdrop-blur-md">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 text-gray-500 hover:text-txt-primary hover:bg-gray-100 rounded-[8px] text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className={`px-5 py-2 flex items-center justify-center gap-2 bg-orange-primary hover:bg-orange-hover text-white rounded-[8px] text-xs font-bold transition-colors shadow-sm ${isUploading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish Design"
              )}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
