import { MetadataRoute } from 'next';
import { connectDB } from '@/lib/db';
import Post from '@/models/Post';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://kura-ai.vercel.app';

  // Get all posts for dynamic routes
  await connectDB();
  const posts = await Post.find({}, '_id updatedAt').lean();

  const postUrls = posts.map((post: any) => ({
    url: `${baseUrl}/post/${post._id.toString()}`,
    lastModified: post.updatedAt || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...postUrls,
  ];
}
