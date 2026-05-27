import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getAuthUser, unauthorizedResponse } from "@/lib/auth";

/**
 * PUT /api/users/me — Update own profile
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorizedResponse();

    await connectDB();
    const body = await request.json();

    const { userName, userHandle, bio, website, location, avatar } = body;

    // Check if handle is taken by another user
    if (userHandle && userHandle !== user.userHandle) {
      const existing = await User.findOne({ userHandle });
      if (existing) {
        return Response.json({ error: "Handle is already taken" }, { status: 400 });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        ...(userName && { userName }),
        ...(userHandle && { userHandle }),
        ...(bio !== undefined && { bio }),
        ...(website !== undefined && { website }),
        ...(location !== undefined && { location }),
        ...(avatar !== undefined && { avatar }),
      },
      { new: true }
    ).lean();

    if (!updatedUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userResponse = {
      id: updatedUser._id.toString(),
      userName: updatedUser.userName,
      userHandle: updatedUser.userHandle,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      website: updatedUser.website,
      location: updatedUser.location,
      followersCount: updatedUser.followersCount,
      followingCount: updatedUser.followingCount,
    };

    return Response.json({ message: "Profile updated successfully", user: userResponse });
  } catch (error: any) {
    console.error("PUT /api/users/me error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
