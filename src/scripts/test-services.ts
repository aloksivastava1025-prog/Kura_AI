import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testServices() {
  console.log("=== Running Services Diagnostic Test ===\n");

  // 1. Test MongoDB
  console.log("[1/2] Testing MongoDB Connection...");
  if (!MONGODB_URI) {
    console.log("❌ MongoDB: No MONGODB_URI found in .env.local");
  } else {
    try {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      console.log("✅ MongoDB: Successfully connected to the database!");
      await mongoose.disconnect();
    } catch (error: any) {
      console.log("❌ MongoDB: Connection failed!");
      console.log("   Error:", error.message);
    }
  }

  console.log("\n----------------------------------------\n");

  // 2. Test Cloudinary
  console.log("[2/2] Testing Cloudinary Connection...");
  if (!process.env.CLOUDINARY_API_KEY) {
    console.log("❌ Cloudinary: Missing credentials in .env.local");
  } else {
    try {
      // Create a tiny 1x1 transparent PNG as base64 to test upload
      const testImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
      const result = await cloudinary.uploader.upload(testImage, { folder: "diagnostic_test" });
      console.log("✅ Cloudinary: Upload successful!");
      console.log("   Test Image URL:", result.secure_url);
      
      // Cleanup: Delete the test image
      await cloudinary.uploader.destroy(result.public_id);
      console.log("   (Test image cleaned up)");
    } catch (error: any) {
      console.log("❌ Cloudinary: Upload failed!");
      console.log("   Error:", error.message || error);
    }
  }

  console.log("\n=== Diagnostic Test Complete ===");
  process.exit(0);
}

testServices();
