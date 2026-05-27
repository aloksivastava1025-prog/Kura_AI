import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import { getAuthUser, unauthorizedResponse } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/posts/[id] — Get a single post with comments.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    const post = await Post.findById(id)
      .populate("author", "userName userHandle avatar followersCount followingCount bio cover")
      .lean();

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    // Increment view count
    await Post.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    // Fetch comments
    const comments = await Comment.find({ post: id })
      .populate("author", "userName userHandle avatar")
      .sort({ createdAt: -1 })
      .lean();

    const authUser = await getAuthUser(request);

    const transformedComments = comments.map((c: any) => ({
      id: c._id.toString(),
      userName: c.author.userName,
      userHandle: c.author.userHandle,
      userAvatar: c.author.avatar,
      body: c.body,
      likeCount: c.likeCount,
      createdAt: c.createdAt,
    }));

    const response = {
      id: (post as any)._id.toString(),
      title: post.title,
      description: post.description,
      contentType: post.contentType,
      imageUrls: post.imageUrls,
      thumbnailUrl: post.thumbnailUrl,
      tags: post.tags,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      viewCount: post.viewCount + 1,
      isSensitive: post.isSensitive,
      bentoSize: post.bentoSize,
      createdAt: post.createdAt,
      userId: (post.author as any)._id.toString(),
      userName: (post.author as any).userName,
      userHandle: (post.author as any).userHandle,
      userAvatar: (post.author as any).avatar,
      userBio: (post.author as any).bio,
      userCover: (post.author as any).cover,
      userFollowersCount: (post.author as any).followersCount,
      userFollowingCount: (post.author as any).followingCount,
      isLiked: authUser
        ? post.likes.some((lid: any) => lid.toString() === authUser._id.toString())
        : false,
      isFollowing: authUser
        ? authUser.following.some((fid: any) => fid.toString() === (post.author as any)._id.toString())
        : false,
      aiEngine: post.aiEngine || undefined,
      aiPrompt: post.aiPrompt || undefined,
      aiStyle: post.aiStyle || undefined,
      aiAspectRatio: post.aiAspectRatio || undefined,
      comments: transformedComments,
    };

    return Response.json({ post: response });
  } catch (error: any) {
    console.error("GET /api/posts/[id] error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/posts/[id] — Delete own post. Requires authentication.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorizedResponse();

    await connectDB();
    const { id } = await params;

    const post = await Post.findById(id);
    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.author.toString() !== user._id.toString()) {
      return Response.json({ error: "Not authorized to delete this post" }, { status: 403 });
    }

    // Delete associated comments
    await Comment.deleteMany({ post: id });
    await post.deleteOne();

    return Response.json({ message: "Post deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/posts/[id] error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/posts/[id] — Edit own post. Requires authentication.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorizedResponse();

    await connectDB();
    const { id } = await params;

    const post = await Post.findById(id);
    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.author.toString() !== user._id.toString()) {
      return Response.json({ error: "Not authorized to edit this post" }, { status: 403 });
    }

    const body = await request.json();
    
    // Update fields if provided
    if (body.title !== undefined) post.title = body.title;
    if (body.description !== undefined) post.description = body.description;
    if (body.tags !== undefined) post.tags = body.tags;
    if (body.contentType !== undefined) post.contentType = body.contentType;
    if (body.isSensitive !== undefined) post.isSensitive = body.isSensitive;

    await post.save();

    return Response.json({ message: "Post updated successfully", post });
  } catch (error: any) {
    console.error("PUT /api/posts/[id] error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
