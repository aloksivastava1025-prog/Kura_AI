import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a base64 image string or a file buffer to Cloudinary.
 * Returns the secure URL of the uploaded image.
 */
export async function uploadImage(
  fileData: string, // base64 data URI or file path
  folder: string = "aesthetic-blueprints"
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(fileData, {
    folder,
    resource_type: "image",
    transformation: [
      { quality: "auto", fetch_format: "auto" },
    ],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export default cloudinary;
