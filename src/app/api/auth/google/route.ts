import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { generateToken } from "@/lib/auth";
import { decodeJwt } from "jose";

/**
 * Helper to decode JWT without signature verification (useful for Firebase public payload extraction)
 */
function decodeToken(token: string): any {
  try {
    return decodeJwt(token);
  } catch (err) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { idToken, user: clientUser } = body;

    if (!idToken) {
      return Response.json({ error: "idToken is required" }, { status: 400 });
    }

    let email = "";
    let userName = "";
    let avatar = "";

    // 1. Resolve User Details based on whether it is Mock or Real
    if (idToken.startsWith("mock-google-id-token")) {
      // Dev mock mode
      email = clientUser?.email || "rahul@example.com";
      userName = clientUser?.name || "Rahul Verma";
      avatar = clientUser?.photoURL || "/avatars/rahul.jpg";
    } else {
      // Real Firebase token verification (decode payload)
      const decodedToken = decodeToken(idToken);
      if (!decodedToken) {
        return Response.json({ error: "Invalid Firebase ID Token" }, { status: 400 });
      }

      email = decodedToken.email;
      userName = decodedToken.name || decodedToken.email.split("@")[0];
      avatar = decodedToken.picture || "";
    }

    if (!email) {
      return Response.json({ error: "Email missing from Google Auth" }, { status: 400 });
    }

    // 2. Look up the User in MongoDB
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // 3. User doesn't exist, create a new one!
      
      // Generate clean handle from email prefix
      let handleBase = email.split("@")[0].toLowerCase().replace(/[^a-z0-9._]/g, "");
      if (!handleBase) handleBase = "user";
      
      // Ensure unique handle
      let userHandle = handleBase;
      let suffix = 1;
      while (await User.findOne({ userHandle })) {
        userHandle = `${handleBase}${suffix}`;
        suffix++;
      }

      // Generate a secure random password for DB requirements
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-10), salt);

      user = await User.create({
        userName,
        userHandle,
        email: email.toLowerCase(),
        avatar,
        password: hashedPassword,
        cover: "",
        bio: "Joined via Google Auth.",
        website: "",
        location: "",
        followersCount: 0,
        followingCount: 0,
        following: [],
      });
    }

    // 4. Sign JWT
    const token = await generateToken(user._id.toString());

    const userResponse = {
      id: user._id,
      userName: user.userName,
      userHandle: user.userHandle,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
    };

    return Response.json({ user: userResponse, token });
  } catch (error: any) {
    console.error("Google login API error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
