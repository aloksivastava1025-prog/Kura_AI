import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userName, userHandle, email, password } = body;

    // Validate required fields
    if (!userName || !userHandle || !email || !password) {
      return Response.json(
        { error: "All fields are required: userName, userHandle, email, password" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if email or handle already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { userHandle: userHandle.toLowerCase() }],
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? "email" : "handle";
      return Response.json(
        { error: `A user with this ${field} already exists` },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      userName: userName.trim(),
      userHandle: userHandle.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    // Generate JWT
    const token = await generateToken(user._id.toString());

    // Return user (without password) + token
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

    return Response.json(
      { user: userResponse, token },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);

    // Mongoose validation errors
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
