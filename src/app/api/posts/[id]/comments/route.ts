import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import { getAuthUser, unauthorizedResponse } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/posts/[id]/comments — Fetch comments for a post
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    const comments = await Comment.find({ post: id })
      .populate("author", "userName userHandle avatar")
      .sort({ createdAt: -1 })
      .lean();

    const transformedComments = comments.map((c: any) => ({
      id: c._id.toString(),
      userName: c.author.userName,
      userHandle: c.author.userHandle,
      userAvatar: c.author.avatar,
      body: c.body,
      likeCount: c.likeCount,
      createdAt: c.createdAt,
    }));

    return Response.json({ comments: transformedComments });
  } catch (error: any) {
    console.error("GET /api/posts/[id]/comments error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/posts/[id]/comments — Add a comment to a post
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorizedResponse();

    await connectDB();
    const { id } = await params;

    const body = await request.json();
    if (!body.body?.trim()) {
      return Response.json({ error: "Comment body is required" }, { status: 400 });
    }

    const post = await Post.findById(id);
    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    const comment = await Comment.create({
      body: body.body.trim(),
      author: user._id,
      post: id,
    });

    // Increment post comment count
    await Post.findByIdAndUpdate(id, { $inc: { commentCount: 1 } });

    // Return the new comment transformed for frontend
    const newComment = {
      id: comment._id.toString(),
      userName: user.userName,
      userHandle: user.userHandle,
      userAvatar: user.avatar,
      body: comment.body,
      likeCount: 0,
      createdAt: comment.createdAt,
    };

    return Response.json({ comment: newComment }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/posts/[id]/comments error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
