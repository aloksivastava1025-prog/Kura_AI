import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { getAuthUser, unauthorizedResponse } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorizedResponse();

    await connectDB();
    const { id } = await params;

    const post = await Post.findById(id);
    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    const isLiked = post.likes.includes(user._id);

    if (isLiked) {
      // Unlike
      await Post.findByIdAndUpdate(id, {
        $pull: { likes: user._id },
        $inc: { likeCount: -1 }
      });
      return Response.json({ message: "Post unliked", isLiked: false });
    } else {
      // Like
      await Post.findByIdAndUpdate(id, {
        $addToSet: { likes: user._id },
        $inc: { likeCount: 1 }
      });
      return Response.json({ message: "Post liked", isLiked: true });
    }
  } catch (error: any) {
    console.error("POST /api/posts/[id]/like error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
