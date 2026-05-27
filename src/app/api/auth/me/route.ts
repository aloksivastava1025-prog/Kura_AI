import { NextRequest } from "next/server";
import { getAuthUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return unauthorizedResponse();
    }

    return Response.json({
      user: {
        id: user._id,
        userName: user.userName,
        userHandle: user.userHandle,
        email: user.email,
        avatar: user.avatar,
        cover: user.cover,
        bio: user.bio,
        website: user.website,
        location: user.location,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        following: user.following,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Auth/me error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
