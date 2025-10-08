import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { PostCard } from '@/components/PostCard';
import { NewsletterSubscription } from '@/components/NewsletterSubscription';
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
          <FileText className="h-12 w-12 text-coffee" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cream to-amber/20 dark:from-charcoal dark:to-coffee/20 py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
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
                <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-coffee" />
              </motion.div>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gradient-coffee leading-tight">
              PatchNotes
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Stay updated with the latest technology insights, development updates, 
              and tech discussions by Dev.MK
            </p>
          </motion.div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No posts yet</h3>
            <p className="text-muted-foreground">
              Check back soon for fresh updates!
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

      {/* Newsletter Section */}
      <section className="bg-gradient-to-br from-coffee/10 to-amber/10 dark:from-coffee/20 dark:to-amber/20 py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-4 text-coffee">
                Stay Updated
              </h2>
              <p className="text-muted-foreground mb-8">
                Get notified when we publish new updates. No spam, just quality content delivered to your inbox.
              </p>
              <NewsletterSubscription 
                variant="default"
                title="Subscribe to Our Newsletter"
                description="Get the latest articles delivered to your inbox"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
