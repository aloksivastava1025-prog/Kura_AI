import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";
import { getAuthUser, unauthorizedResponse } from "@/lib/auth";

/**
 * GET /api/posts — Fetch posts with optional filters and pagination.
 * Query params: ?contentType=ai_art&search=neon&page=1&limit=20
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get("contentType");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    // Build query filter
    const filter: any = {};

    if (contentType === "rising_stars") {
      // Backend algorithm for "Rising Stars" (MVP: under 100 likes)
      filter.likeCount = { $lt: 100 };
    } else if (contentType && contentType !== "all") {
      filter.contentType = contentType;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Get the authenticated user to check like/follow status
    const authUser = await getAuthUser(request);

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("author", "userName userHandle avatar followersCount followingCount bio cover")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(filter),
    ]);

    // Transform posts for the frontend
    const transformedPosts = posts.map((post: any) => ({
      id: post._id.toString(),
      title: post.title,
      description: post.description,
      contentType: post.contentType,
      imageUrls: post.imageUrls,
      thumbnailUrl: post.thumbnailUrl,
      tags: post.tags,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      viewCount: post.viewCount,
      isSensitive: post.isSensitive,
      bentoSize: post.bentoSize,
      createdAt: post.createdAt,

      // Author info flattened for frontend compatibility
      userId: post.author._id.toString(),
      userName: post.author.userName,
      userHandle: post.author.userHandle,
      userAvatar: post.author.avatar,
      userBio: post.author.bio,
      userCover: post.author.cover,
      userFollowersCount: post.author.followersCount,
      userFollowingCount: post.author.followingCount,

      // User-specific state
      isLiked: authUser
        ? post.likes.some((id: any) => id.toString() === authUser._id.toString())
        : false,
      isFollowing: authUser
        ? authUser.following.some((id: any) => id.toString() === post.author._id.toString())
        : false,

      // AI Metadata
      aiEngine: post.aiEngine || undefined,
      aiPrompt: post.aiPrompt || undefined,
      aiStyle: post.aiStyle || undefined,
      aiAspectRatio: post.aiAspectRatio || undefined,

      // Comments will be fetched separately
      comments: [],
    }));

    return Response.json({
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET /api/posts error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts — Create a new post. Requires authentication.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorizedResponse();
    }

    await connectDB();

    const body = await request.json();
    const {
      title,
      description,
      contentType,
      imageUrls,
      thumbnailUrl,
      tags,
      isSensitive,
      bentoSize,
      aiEngine,
      aiPrompt,
      aiStyle,
      aiAspectRatio,
    } = body;

    if (!title?.trim()) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    const post = await Post.create({
      title: title.trim(),
      description: description || "",
      contentType: contentType || "other",
      imageUrls: imageUrls || [],
      thumbnailUrl: thumbnailUrl || (imageUrls?.[0] || ""),
      tags: tags || [],
      isSensitive: isSensitive || false,
      bentoSize: bentoSize || "small",
      author: user._id,
      aiEngine: aiEngine || "",
      aiPrompt: aiPrompt || "",
      aiStyle: aiStyle || "",
      aiAspectRatio: aiAspectRatio || "",
    });

    // Populate author for response
    await post.populate("author", "userName userHandle avatar followersCount followingCount");

    const response = {
      id: post._id.toString(),
      title: post.title,
      description: post.description,
      contentType: post.contentType,
      imageUrls: post.imageUrls,
      thumbnailUrl: post.thumbnailUrl,
      tags: post.tags,
      likeCount: 0,
      commentCount: 0,
      viewCount: 0,
      isSensitive: post.isSensitive,
      bentoSize: post.bentoSize,
      createdAt: post.createdAt,
      userId: user._id.toString(),
      userName: (post.author as any).userName,
      userHandle: (post.author as any).userHandle,
      userAvatar: (post.author as any).avatar,
      userFollowersCount: (post.author as any).followersCount,
      userFollowingCount: (post.author as any).followingCount,
      isLiked: false,
      isFollowing: false,
      aiEngine: post.aiEngine || undefined,
      aiPrompt: post.aiPrompt || undefined,
      aiStyle: post.aiStyle || undefined,
      aiAspectRatio: post.aiAspectRatio || undefined,
      comments: [],
    };

    return Response.json({ post: response }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/posts error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      return Response.json({ error: messages.join(", ") }, { status: 400 });
    }

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
