import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coffee, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImageUrl?: string | null;
  tags: string[];
  category: string;
  publishedAt: string;
}

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (cursor?: string) => {
    try {
      const url = cursor ? `/posts?limit=9&cursor=${cursor}` : '/posts?limit=9';
      const { data } = await apiClient.get(url);
      
      if (cursor) {
        setPosts((prev) => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }
      
      setNextCursor(data.nextCursor || null);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to load posts';
      toast.error(message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (nextCursor && !loadingMore) {
      setLoadingMore(true);
      fetchPosts(nextCursor);
    }
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cream to-amber/20 dark:from-charcoal dark:to-coffee/20 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center space-x-2 mb-6">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Coffee className="h-12 w-12 text-coffee" />
              </motion.div>
            </div>
            <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6 text-gradient-coffee">
              Caffeinated Thoughts
            </h1>
            <p className="text-xl text-muted-foreground">
              A blog fueled by coffee and curiosity. Exploring technology, creativity, 
              and everything in between.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="container mx-auto px-4 py-16">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <Coffee className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No posts yet</h3>
            <p className="text-muted-foreground">
              Check back soon for fresh content!
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {nextCursor && (
              <div className="flex justify-center">
                <Button
                  onClick={loadMore}
                  disabled={loadingMore}
                  size="lg"
                  className="bg-coffee hover:bg-coffee/90"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default Home;
