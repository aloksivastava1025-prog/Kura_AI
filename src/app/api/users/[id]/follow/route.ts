import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getAuthUser, unauthorizedResponse } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    await connectDB();
    const { id: targetUserId } = await params;

    if (authUser._id.toString() === targetUserId) {
      return Response.json({ error: "You cannot follow yourself" }, { status: 400 });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const isFollowing = authUser.following.includes(targetUser._id);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(authUser._id, {
        $pull: { following: targetUser._id },
        $inc: { followingCount: -1 }
      });
      await User.findByIdAndUpdate(targetUserId, {
        $inc: { followersCount: -1 }
      });
      return Response.json({ message: "Unfollowed user", isFollowing: false });
    } else {
      // Follow
      await User.findByIdAndUpdate(authUser._id, {
        $addToSet: { following: targetUser._id },
        $inc: { followingCount: 1 }
      });
      await User.findByIdAndUpdate(targetUserId, {
        $inc: { followersCount: 1 }
      });
      return Response.json({ message: "Followed user", isFollowing: true });
    }
  } catch (error: any) {
    console.error("POST /api/users/[id]/follow error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
