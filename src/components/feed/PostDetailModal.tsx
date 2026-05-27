"use client";

import { useState } from "react";
import { Heart, MessageCircle, Share2, Sparkles, X, Copy, Check, ShieldAlert, Send, Download, Trash2, Edit3, Save } from "lucide-react";
import { motion } from "framer-motion";
import { Post, Comment } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";

interface PostDetailModalProps {
  post: Post;
  allPosts: Post[];
  onClose: () => void;
  onLikeToggle: (postId: string) => void;
  onFollowToggle: (userId: string) => void;
  activeUser: { userName: string; userHandle: string; id?: string } | null;
  onAddComment: (postId: string, commentBody: string) => void;
  onDownloadClick: (post: Post) => void;
  onDeletePost: (postId: string) => void;
  onEditPost: (postId: string, fields: Partial<Post>) => void;
}

export default function PostDetailModal({
  post,
  allPosts,
  onClose,
  onLikeToggle,
  onFollowToggle,
  activeUser,
  onAddComment,
  onDownloadClick,
  onDeletePost,
  onEditPost,
}: PostDetailModalProps) {
  const { addToast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editDescription, setEditDescription] = useState(post.description);

  // Compute other posts by the same creator
  const creatorPosts = allPosts.filter(p => p.userId === post.userId && p.id !== post.id);

  const handleCopyPrompt = () => {
    if (post.aiPrompt) {
      navigator.clipboard.writeText(post.aiPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText);
    setCommentText("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Background close trigger */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="bg-bg-card w-full max-w-[1200px] h-[90vh] md:h-[85vh] rounded-card overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row border border-gray-100"
      >
        {/* Close Button (Moved to absolute top-right of modal so it overlaps right side) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full border border-gray-200 text-gray-500 hover:text-orange-primary hover:scale-105 transition-all shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left: Fixed Image Panel + Creator Profile */}
        <div className="md:w-[55%] lg:w-[60%] h-[50vh] md:h-full bg-[#111] relative md:border-r border-gray-100 overflow-hidden">

          {/* Scrollable Image Container */}
          <div className="h-full w-full bg-[#111] overflow-y-auto no-scrollbar relative">
            <img
              src={post.thumbnailUrl}
              alt={post.title}
              className="w-full h-auto object-cover select-none"
            />
          </div>

          {/* Creator name overlay on image — minimal */}
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-5 pb-4 pt-12 pointer-events-none">
            <span className="font-display font-bold text-white text-sm drop-shadow-lg">📸 {post.userName}</span>
          </div>
        </div>

        {/* Right: Post Details, Discussion & More Content */}
        <div className="md:w-[45%] lg:w-[40%] h-[50vh] md:h-full flex flex-col justify-between bg-white overflow-hidden relative">

          {/* Creator Header + Follow (pinned at top of right panel) */}
          <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-primary to-[#FF8A3D] flex items-center justify-center font-display font-black text-sm text-white select-none shadow-md">
                {post.userName.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[13px] text-[#111] leading-tight">
                  {post.userName}
                </span>
                <span className="text-[11px] text-gray-400 mt-0.5">
                  @{post.userHandle} • {post.userFollowersCount} followers
                </span>
              </div>
            </div>
            {activeUser?.id !== post.userId && (
              <button
                onClick={() => onFollowToggle(post.userId)}
                className={`px-5 py-2 rounded-[8px] text-xs font-bold tracking-wide transition-all border ${post.isFollowing
                    ? "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                    : "bg-orange-primary text-white border-orange-primary hover:bg-orange-hover shadow-[0_4px_14px_rgba(255,90,0,0.25)]"
                  }`}
              >
                {post.isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col gap-5">

            {/* Title & Metadata */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#111] text-white px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase">
                  {post.contentType === 'ai_art' && 'AI Art'}
                  {post.contentType === 'photography' && 'Photography'}
                  {post.contentType === 'design' && 'Design'}
                  {post.contentType === 'illustration' && 'Illustration'}
                </span>
                <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                  {new Date(post.createdAt).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              </div>
              
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full font-display font-bold text-xl md:text-2xl text-[#111] tracking-tight leading-tight border-b border-gray-200 focus:border-orange-primary focus:outline-none pb-1 bg-transparent"
                  placeholder="Post Title..."
                />
              ) : (
                <h1 className="font-display font-bold text-xl md:text-2xl text-[#111] tracking-tight leading-tight">
                  {post.title}
                </h1>
              )}
            </div>

            {/* Description */}
            {isEditing ? (
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full text-sm md:text-base text-gray-500 leading-relaxed border border-gray-200 rounded-md p-2 focus:border-orange-primary focus:outline-none bg-transparent resize-none"
                rows={3}
                placeholder="Description..."
              />
            ) : (
              <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                {post.description}
              </p>
            )}

            {/* Category Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-50 text-gray-500 px-3.5 py-1.5 rounded-full text-[11px] font-semibold hover:bg-gray-100 hover:text-[#111] transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Interaction Action Row (Large Premium Buttons) */}
            <div className="flex items-center gap-2 py-2 mt-2">
              <button
                onClick={() => onLikeToggle(post.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[12px] font-bold text-sm transition-all ${post.isLiked
                    ? "bg-red-50 text-red-500 hover:bg-red-100"
                    : "bg-gray-50 text-[#111] hover:bg-gray-100"
                  }`}
              >
                <Heart className={`w-4 h-4 ${post.isLiked ? "fill-red-500" : ""}`} />
                {post.likeCount} {post.likeCount === 1 ? "Like" : "Likes"}
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                  if (addToast) {
                    addToast("Link copied to clipboard!", "success");
                  } else {
                    alert("Post link copied!");
                  }
                }}
                className="flex items-center justify-center gap-2 w-14 h-[48px] bg-gray-50 text-[#111] hover:bg-gray-100 rounded-[12px] transition-colors"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDownloadClick(post)}
                className="flex items-center justify-center gap-2 w-14 h-[48px] bg-[#111] hover:bg-orange-primary text-white rounded-[12px] transition-colors"
                title="Download high-res image"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                className="flex items-center justify-center gap-2 w-14 h-[48px] bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-[12px] transition-colors"
                title="Report Post"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>

              {activeUser?.id === post.userId && (
                <>
                  {isEditing ? (
                    <button
                      onClick={() => {
                        onEditPost(post.id, { title: editTitle, description: editDescription });
                        setIsEditing(false);
                      }}
                      className="flex items-center justify-center gap-2 w-14 h-[48px] bg-green-50 text-green-600 hover:bg-green-100 rounded-[12px] transition-colors"
                      title="Save Changes"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center justify-center gap-2 w-14 h-[48px] bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-[12px] transition-colors"
                      title="Edit Post"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onDeletePost(post.id)}
                    className="flex items-center justify-center gap-2 w-14 h-[48px] bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 rounded-[12px] transition-colors"
                    title="Delete Post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* AI Generation Metadata Card */}
            {post.aiEngine && (
              <div className="rounded-[10px] border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#111]">
                  <div className="flex items-center gap-2 text-white">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="font-display font-bold text-[11px] tracking-wider uppercase">
                      AI Recipe
                    </span>
                  </div>
                  <span className="bg-orange-primary text-white px-2.5 py-0.5 rounded-[5px] text-[9px] font-black tracking-wider uppercase">
                    {post.aiEngine}
                  </span>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100 bg-gray-50/50">
                  <div className="px-4 py-3">
                    <span className="block text-[9px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Style</span>
                    <span className="text-[12px] font-semibold text-[#111]">{post.aiStyle || "—"}</span>
                  </div>
                  <div className="px-4 py-3">
                    <span className="block text-[9px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Ratio</span>
                    <span className="text-[12px] font-semibold text-[#111]">{post.aiAspectRatio || "1:1"}</span>
                  </div>
                </div>

                {/* Prompt */}
                {post.aiPrompt && (
                  <div className="px-4 py-3 bg-white relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Prompt</span>
                      <button
                        onClick={handleCopyPrompt}
                        disabled={!post.isLiked}
                        className={`flex items-center gap-1 text-[9px] font-bold transition-colors ${
                          !post.isLiked 
                            ? "text-gray-300 cursor-not-allowed" 
                            : "text-orange-primary hover:text-orange-hover"
                        }`}
                      >
                        {copiedPrompt ? (
                          <>
                            <Check className="w-3 h-3 stroke-[2.5px]" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    
                    <div className="relative">
                      <div className={`bg-gray-50 p-3 rounded-[6px] border border-gray-100 text-[11px] font-mono text-gray-600 select-all break-words leading-relaxed whitespace-pre-wrap max-h-[180px] overflow-y-auto no-scrollbar transition-all duration-500 ${!post.isLiked ? 'blur-[4px] select-none opacity-50' : ''}`}>
                        {post.aiPrompt}
                      </div>
                      
                      {!post.isLiked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer" onClick={() => onLikeToggle(post.id)}>
                          <div className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-200 flex items-center gap-2 transform hover:scale-105 transition-all">
                            <Heart className="w-4 h-4 text-orange-primary" />
                            <span className="text-xs font-bold text-gray-900 tracking-tight">Like to reveal prompt</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* More by Creator Section */}
            {creatorPosts.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="font-display font-bold text-xs uppercase tracking-wider text-txt-secondary flex items-center gap-2">
                  <div className="w-4 h-1 bg-orange-primary rounded-full"></div>
                  More by {post.userName}
                </span>

                {/* Using columns-2 masonry layout to preserve original aspect ratios */}
                <div className="columns-2 gap-2 mt-2 w-full">
                  {creatorPosts.slice(0, 4).map((cp) => (
                    <div
                      key={cp.id}
                      className="rounded-[8px] overflow-hidden bg-gray-100 relative group cursor-pointer border border-gray-100 shadow-sm hover:shadow-md transition-all mb-2 break-inside-avoid"
                    >
                      <img
                        src={cp.thumbnailUrl}
                        alt={cp.title}
                        className="w-full h-auto block object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-white text-[10px] font-bold line-clamp-1">{cp.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic Comments List */}
            <div className="flex flex-col gap-4">
              <span className="font-display font-bold text-xs uppercase tracking-wider text-txt-secondary flex items-center gap-2">
                <div className="w-4 h-1 bg-gray-300 rounded-full"></div>
                Discussion ({post.commentCount})
              </span>

              {post.comments.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400 font-medium bg-gray-50 rounded-[12px] border border-gray-100 border-dashed">
                  Be the first to comment. Share your style thoughts!
                </div>
              ) : (
                <div className="flex flex-col gap-4 mt-2">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3 text-xs leading-relaxed animate-fade-in">
                      <div className="w-8 h-8 rounded-full bg-orange-light border border-orange-primary/10 flex items-center justify-center font-display font-black text-xs text-orange-primary select-none shrink-0 mt-1">
                        {comment.userName.charAt(0)}
                      </div>
                      <div className="flex-1 bg-gray-50/70 border border-gray-100 p-3 rounded-[12px] shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-txt-primary">
                            @{comment.userHandle}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {new Date(comment.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric"
                            })}
                          </span>
                        </div>
                        <p className="text-txt-secondary">{comment.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lower Input Section (Sticky Bottom) */}
          <div className="p-4 border-t border-gray-100 bg-white/90 sticky bottom-0 z-10 backdrop-blur-md">
            {activeUser ? (
              <form onSubmit={handleCommentSubmit} className="flex gap-2 relative">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  maxLength={300}
                  placeholder="Leave a style remark..."
                  className="flex-1 bg-gray-50 border border-gray-200 focus:border-orange-primary focus:bg-white rounded-[10px] px-4 py-3 text-xs focus:outline-none transition-all text-gray-900"
                />
                <button
                  type="submit"
                  className={`absolute right-1 top-1 bottom-1 px-3 rounded-[8px] transition-colors flex items-center justify-center shrink-0 ${commentText.trim()
                      ? "bg-orange-primary hover:bg-orange-hover text-white shadow-sm"
                      : "bg-gray-100 text-gray-300 cursor-not-allowed"
                    }`}
                  disabled={!commentText.trim()}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div 
                onClick={() => onAddComment(post.id, "")}
                className="flex-1 bg-gray-50/80 border border-gray-200 hover:border-orange-primary hover:bg-white rounded-[10px] px-4 py-3 text-xs cursor-pointer text-gray-400 font-semibold text-center transition-all select-none"
              >
                Unlock creative discussion. Sign in with Google to post.
              </div>
            )}
          </div>

        </div>
      </motion.div>
    </div>
  );
}
