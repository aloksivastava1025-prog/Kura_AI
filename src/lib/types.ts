export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userHandle: string;
  body: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  contentType: "ai_art" | "photography" | "design" | "illustration" | "other";
  imageUrls: string[];
  thumbnailUrl: string;
  tags: string[];
  likeCount: number;
  commentCount: number;
  viewCount: number;
  isSensitive: boolean;
  userId: string;
  userName: string;
  userHandle: string;
  userAvatar: string;
  userFollowersCount: number;
  userFollowingCount: number;
  createdAt: string;
  bentoSize: "small" | "large" | "wide" | "tall";

  // Interaction State
  isLiked?: boolean;
  isFollowing?: boolean;

  // AI Metadata (Optional)
  aiEngine?: string;
  aiPrompt?: string;
  aiStyle?: string;
  aiAspectRatio?: string;

  comments: Comment[];
}

export interface User {
  id: string;
  userName: string;
  userHandle: string;
  userAvatar: string;
  followersCount: number;
  followingCount: number;
  bio: string;
  website: string;
  location: string;
  isFollowing?: boolean;
}
