import { NextRequest } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { getAuthUser, unauthorizedResponse } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { image } = body; // Base64 image string

    if (!image) {
      return Response.json({ error: "Image data is required" }, { status: 400 });
    }

    if (!process.env.CLOUDINARY_API_KEY) {
      // Fallback for development if Cloudinary is not configured
      console.warn("Cloudinary not configured. Returning the base64 string directly.");
      return Response.json({ url: image });
    }

    const { url } = await uploadImage(image);

    return Response.json({ url });
  } catch (error: any) {
    console.error("POST /api/upload error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
