import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Tag, Coffee, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BuyCoffeeModal } from '@/components/BuyCoffeeModal';
import { markdownComponents } from '@/lib/markdown';
import { toast } from 'sonner';
import 'highlight.js/styles/github-dark.css';

interface Post {
  id: string;
  title: string;
  slug: string;
  contentMarkdown: string;
  excerpt: string | null;
  featuredImageUrl?: string | null;
  tags: string[];
  category: string;
  status: string;
  publishedAt: string;
}

const PostDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCoffeeModalOpen, setIsCoffeeModalOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const { data } = await apiClient.get(`/posts/${slug}`);
      setPost(data.post);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to load post';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Coffee className="h-12 w-12 text-coffee" />
        </motion.div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-heading font-bold mb-4">Post not found</h2>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <article className="min-h-screen">
        {/* Back Button */}
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Posts
            </Button>
          </Link>
        </div>

        {/* Featured Image */}
        {post.featuredImageUrl && (
          <div className="w-full max-h-[500px] overflow-hidden">
            <img
              src={post.featuredImageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{calculateReadTime(post.contentMarkdown)}</span>
              </div>
              <Badge variant="secondary">{post.category}</Badge>
            </div>

            {/* Title */}
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-coffee leading-tight">
              {post.title}
            </h1>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Markdown Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {post.contentMarkdown}
              </ReactMarkdown>
            </div>

            {/* Buy Coffee CTA */}
            <div className="mt-12 p-6 rounded-lg border-2 border-emerald/30 bg-emerald/5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-xl font-bold mb-2 flex items-center">
                    <Coffee className="h-5 w-5 mr-2 text-emerald" />
                    Enjoyed this post?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Support my work with a virtual coffee!
                  </p>
                </div>
                <Button
                  onClick={() => setIsCoffeeModalOpen(true)}
                  className="bg-emerald hover:bg-emerald/90"
                >
                  <Coffee className="mr-2 h-4 w-4" />
                  Buy Me a Coffee
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Coffee Button (Mobile) */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          className="fixed bottom-6 right-6 md:hidden z-50"
        >
          <Button
            onClick={() => setIsCoffeeModalOpen(true)}
            size="lg"
            className="rounded-full h-14 w-14 shadow-coffee-xl bg-emerald hover:bg-emerald/90"
          >
            <Coffee className="h-6 w-6" />
          </Button>
        </motion.div>
      </article>

      <BuyCoffeeModal
        isOpen={isCoffeeModalOpen}
        onClose={() => setIsCoffeeModalOpen(false)}
        postId={post.id}
      />
    </>
  );
};

export default PostDetail;
