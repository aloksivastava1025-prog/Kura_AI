import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  contentType: "ai_art" | "photography" | "design" | "illustration" | "other";
  imageUrls: string[];
  thumbnailUrl: string;
  tags: string[];
  likeCount: number;
  commentCount: number;
  viewCount: number;
  isSensitive: boolean;
  bentoSize: "small" | "large" | "wide" | "tall";
  author: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];

  // AI Metadata
  aiEngine: string;
  aiPrompt: string;
  aiStyle: string;
  aiAspectRatio: string;

  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: "",
      maxlength: 2000,
    },
    contentType: {
      type: String,
      enum: ["ai_art", "photography", "design", "illustration", "other"],
      default: "other",
    },
    imageUrls: {
      type: [String],
      default: [],
    },
    thumbnailUrl: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    isSensitive: {
      type: Boolean,
      default: false,
    },
    bentoSize: {
      type: String,
      enum: ["small", "large", "wide", "tall"],
      default: "small",
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // AI Metadata (optional)
    aiEngine: { type: String, default: "" },
    aiPrompt: { type: String, default: "" },
    aiStyle: { type: String, default: "" },
    aiAspectRatio: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

// Indexes for feed queries
PostSchema.index({ createdAt: -1 });
PostSchema.index({ contentType: 1, createdAt: -1 });
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ tags: 1 });

const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);

export default Post;
