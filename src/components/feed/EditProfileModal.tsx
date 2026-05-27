"use client";

import { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface EditProfileModalProps {
  user: any;
  onClose: () => void;
  onSave: (updatedData: any) => Promise<void>;
}

export default function EditProfileModal({ user, onClose, onSave }: EditProfileModalProps) {
  const [userName, setUserName] = useState(user?.userName || "");
  const [userHandle, setUserHandle] = useState(user?.userHandle || "");
  const [bio, setBio] = useState(user?.userBio || user?.bio || "");
  const [website, setWebsite] = useState(user?.website || "");
  const [location, setLocation] = useState(user?.location || "");
  
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        userName,
        userHandle: userHandle.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase(),
        bio,
        website,
        location
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-[24px] overflow-hidden shadow-2xl relative z-10 border border-gray-100 flex flex-col"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-display font-black text-lg text-txt-primary">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-1.5 bg-white rounded-full border border-gray-200 text-gray-500 hover:text-orange-primary transition-colors shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-gray-900">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-txt-secondary">
              Display Name <span className="text-orange-primary">*</span>
            </label>
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full border border-gray-200 focus:border-orange-primary rounded-[8px] px-3 py-2 text-sm focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-txt-secondary">
              Handle <span className="text-orange-primary">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
              <input
                type="text"
                required
                value={userHandle}
                onChange={(e) => setUserHandle(e.target.value)}
                className="w-full border border-gray-200 focus:border-orange-primary rounded-[8px] pl-8 pr-3 py-2 text-sm focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-txt-secondary">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              rows={3}
              className="w-full border border-gray-200 focus:border-orange-primary rounded-[8px] px-3 py-2 text-sm focus:outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-txt-secondary">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="w-full border border-gray-200 focus:border-orange-primary rounded-[8px] px-3 py-2 text-sm focus:outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-txt-secondary">
                Website
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="yourdomain.com"
                className="w-full border border-gray-200 focus:border-orange-primary rounded-[8px] px-3 py-2 text-sm focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="mt-2 w-full py-3 bg-orange-primary hover:bg-orange-hover text-white rounded-xl font-bold text-sm transition-colors shadow-sm disabled:bg-gray-300 flex justify-center"
          >
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
