import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User";
import Post from "../models/Post";
import Comment from "../models/Comment";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/aesthetic-blueprints";

const mockUsers = [
  {
    userName: 'Rahul Verma',
    userHandle: 'rahulverma.ai',
    email: 'rahul@example.com',
    avatar: '/avatars/rahul.jpg',
    cover: '/covers/rahul-cover.jpg',
    bio: 'Freelance AI artist + part-time graphic designer. Creating dreamscapes & neon cyberpunk realities. Midjourney expert.',
    followersCount: 1240,
    followingCount: 89,
    website: 'rahulv.design',
    location: 'New Delhi, India'
  },
  {
    userName: 'Ananya Singh',
    userHandle: 'ananya_creates',
    email: 'ananya@example.com',
    avatar: '/avatars/ananya.jpg',
    cover: '/covers/ananya-cover.jpg',
    bio: 'Design student + digital art enthusiast. Addicted to exploring palettes and composition patterns.',
    followersCount: 420,
    followingCount: 180,
    website: 'ananyasingh.myportfolio.com',
    location: 'Mumbai, India'
  },
  {
    userName: 'Karan Mehta',
    userHandle: 'karanmehta.photo',
    email: 'karan@example.com',
    avatar: '/avatars/karan.jpg',
    cover: '/covers/karan-cover.jpg',
    bio: 'Commercial photographer & brand designer. Capturing shadows, geometry, and raw human emotions.',
    followersCount: 3840,
    followingCount: 245,
    website: 'karanmehta.com',
    location: 'Bangalore, India'
  }
];

const mockPostsRaw = [
  {
    title: 'Neon Oasis — Cyberpunk Cityscape',
    description: 'A vivid exploration of neo-tokyo aesthetics using volumetric lighting and intense neon reflections.',
    contentType: 'ai_art',
    imageUrls: ['/images/neon_oasis.png'],
    thumbnailUrl: '/images/neon_oasis.png',
    bentoSize: 'tall',
    tags: ['Cyberpunk', 'Neon', 'Cityscape', 'Concept Art'],
    likeCount: 482,
    commentCount: 0,
    viewCount: 2400,
    isSensitive: false,
    aiEngine: 'Midjourney',
    authorHandle: 'rahulverma.ai'
  },
  {
    title: 'Organic Clay — Minimalist Vessels',
    description: 'A study of geometric ceramic shapes in warm, natural clay. The play of hard shadows and soft morning sunlight emphasizes the raw texture.',
    contentType: 'photography',
    imageUrls: ['/images/minimal_clay.png'],
    thumbnailUrl: '/images/minimal_clay.png',
    bentoSize: 'large',
    tags: ['Minimalism', 'Photography', 'Product Design', 'Geometry'],
    likeCount: 289,
    commentCount: 0,
    viewCount: 1250,
    isSensitive: false,
    authorHandle: 'ananya_creates'
  },
  {
    title: 'Modernist Botanica Poster',
    description: 'Swiss design inspired exhibition poster featuring abstract botanical elements.',
    contentType: 'illustration',
    imageUrls: ['/images/botanical_harmony.png'],
    thumbnailUrl: '/images/botanical_harmony.png',
    bentoSize: 'small',
    tags: ['Graphic Design', 'Poster', 'Typography', 'Swiss Design'],
    likeCount: 512,
    commentCount: 0,
    viewCount: 1890,
    isSensitive: false,
    authorHandle: 'rahulverma.ai'
  },
  {
    title: 'Holographic Dreams',
    description: 'Experimenting with glass dispersion and iridescent materials in Blender 4.0.',
    contentType: 'design',
    imageUrls: ['/images/holo_dreams.png'],
    thumbnailUrl: '/images/holo_dreams.png',
    bentoSize: 'tall',
    tags: ['3D Art', 'Blender', 'Abstract', 'Iridescent'],
    likeCount: 843,
    commentCount: 0,
    viewCount: 5600,
    isSensitive: false,
    authorHandle: 'karanmehta.photo'
  },
  {
    title: 'Desert Monolith',
    description: 'A massive brutalist structure lost in an endless dune sea. Lighting study.',
    contentType: 'ai_art',
    imageUrls: ['/images/desert_monolith.png'],
    thumbnailUrl: '/images/desert_monolith.png',
    bentoSize: 'wide',
    tags: ['Brutalism', 'Desert', 'Sci-Fi', 'Concept Art'],
    likeCount: 1024,
    commentCount: 0,
    viewCount: 8200,
    isSensitive: false,
    authorHandle: 'ananya_creates'
  }
];

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected!");

    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    
    console.log("Creating users...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    const createdUsers = [];
    for (const userData of mockUsers) {
      const user = await User.create({
        ...userData,
        password: hashedPassword
      });
      createdUsers.push(user);
    }
    console.log(`✅ Created ${createdUsers.length} users`);

    console.log("Creating posts...");
    let postCount = 0;
    for (const postData of mockPostsRaw) {
      const author = createdUsers.find(u => u.userHandle === postData.authorHandle);
      if (author) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { authorHandle, ...rest } = postData;
        await Post.create({
          ...rest,
          author: author._id
        } as any);
        postCount++;
      }
    }
    console.log(`✅ Created ${postCount} posts`);

    console.log("🎉 Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedDatabase();
