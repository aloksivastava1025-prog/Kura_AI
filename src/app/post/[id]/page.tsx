import { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import Post from '@/models/Post';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  await connectDB();
  
  try {
    const post = await Post.findById(params.id).populate('author').lean() as any;
    if (!post) {
      return { title: 'Post Not Found | Kura AI' };
    }

    const title = `${post.title} by ${post.author.userName} | Kura AI`;
    const description = post.description || `Discover ${post.title} on Kura AI, a premium visual discovery platform.`;
    const imageUrl = post.imageUrls?.[0] || post.thumbnailUrl;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: imageUrl }],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (err) {
    return { title: 'Kura AI' };
  }
}

export default async function PostPage({ params }: { params: { id: string } }) {
  await connectDB();
  let post;
  try {
    post = await Post.findById(params.id).populate('author').lean() as any;
  } catch (err) {
    notFound();
  }

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 p-4 md:p-8">
      <Link href="/" className="text-orange-primary font-bold mb-8 inline-block hover:underline">
        &larr; Back to Kura AI
      </Link>
      
      <div className="max-w-5xl mx-auto bg-white rounded-[24px] shadow-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Image */}
        <div className="w-full md:w-[60%] bg-[#111] flex justify-center items-center relative overflow-hidden">
          <img 
            src={post.imageUrls?.[0] || post.thumbnailUrl} 
            alt={post.title} 
            className="w-full h-auto max-h-[85vh] object-contain" 
          />
        </div>
        
        {/* Right Side: Details */}
        <div className="w-full md:w-[40%] p-6 md:p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 leading-tight">
              {post.title}
            </h1>
            <p className="text-gray-500 mt-4 text-base leading-relaxed">
              {post.description}
            </p>
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {post.tags.map((tag: string) => (
                  <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={post.author.avatar || '/avatars/default.jpg'} 
                alt={post.author.userName} 
                className="w-12 h-12 rounded-full border border-gray-200" 
              />
              <div>
                <p className="font-bold text-gray-900">{post.author.userName}</p>
                <p className="text-sm text-gray-500">{post.author.userHandle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
