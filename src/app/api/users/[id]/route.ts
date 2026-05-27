import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
import { getAuthUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/users/[id] — Get a user profile and their posts.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    const userProfile = await User.findById(id).select("-password").lean();
    if (!userProfile) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const authUser = await getAuthUser(request);
    
    // Fetch user's posts
    const posts = await Post.find({ author: id })
      .populate("author", "userName userHandle avatar followersCount followingCount bio cover")
      .sort({ createdAt: -1 })
      .lean();

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
      userId: post.author._id.toString(),
      userName: post.author.userName,
      userHandle: post.author.userHandle,
      userAvatar: post.author.avatar,
      userBio: post.author.bio,
      userCover: post.author.cover,
      userFollowersCount: post.author.followersCount,
      userFollowingCount: post.author.followingCount,
      isLiked: authUser
        ? post.likes.some((lid: any) => lid.toString() === authUser._id.toString())
        : false,
      isFollowing: authUser
        ? authUser.following.some((fid: any) => fid.toString() === post.author._id.toString())
        : false,
      comments: [],
    }));

    const response = {
      id: userProfile._id.toString(),
      userName: userProfile.userName,
      userHandle: userProfile.userHandle,
      email: userProfile.email,
      avatar: userProfile.avatar,
      cover: userProfile.cover,
      bio: userProfile.bio,
      website: userProfile.website,
      location: userProfile.location,
      followersCount: userProfile.followersCount,
      followingCount: userProfile.followingCount,
      isFollowing: authUser 
        ? authUser.following.some((fid: any) => fid.toString() === userProfile._id.toString())
        : false,
      createdAt: userProfile.createdAt,
      posts: transformedPosts,
    };

    return Response.json({ user: response });
  } catch (error: any) {
    console.error("GET /api/users/[id] error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
