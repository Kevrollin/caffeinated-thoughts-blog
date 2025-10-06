import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  User, 
  FileText, 
  ArrowLeft,
  Clock,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

interface Thread {
  id: string;
  title: string;
  slug: string;
  description?: string;
  status: 'DRAFT' | 'PUBLISHED';
  author: {
    id: string;
    name: string;
    email: string;
  };
  posts: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    featuredImageUrl?: string;
    orderInThread: number;
    publishedAt: string;
    createdAt: string;
  }>;
  _count: {
    posts: number;
  };
  createdAt: string;
  updatedAt: string;
}

const ThreadDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: threadData, isLoading, error } = useQuery({
    queryKey: ['thread', slug],
    queryFn: async () => {
      const { data } = await apiClient.get(`/threads/${slug}`);
      return data;
    },
    enabled: !!slug
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <FileText className="h-8 w-8 text-coffee" />
        </motion.div>
      </div>
    );
  }

  if (error || !threadData?.thread) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-heading font-bold text-coffee mb-4">
          Thread Not Found
        </h1>
        <p className="text-muted-foreground mb-8">
          The thread you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  const thread: Thread = threadData.thread;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Thread Header */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-heading font-bold text-coffee">
              {thread.title}
            </h1>
            
            {thread.description && (
              <p className="text-xl text-muted-foreground">
                {thread.description}
              </p>
            )}
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{thread.author.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>{thread._count.posts} posts</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Thread Posts */}
        <div className="space-y-6">
          <h2 className="text-2xl font-heading font-bold text-coffee">
            Posts in this Thread
          </h2>
          
          <div className="space-y-6">
            {thread.posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline">
                            Part {post.orderInThread}
                          </Badge>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <CardTitle className="text-xl font-heading text-coffee">
                          {post.title}
                        </CardTitle>
                        {post.excerpt && (
                          <CardDescription className="mt-2">
                            {post.excerpt}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {post.featuredImageUrl && (
                      <div className="mb-4">
                        <img
                          src={post.featuredImageUrl}
                          alt={post.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <FileText className="h-4 w-4" />
                          <span>Post {post.orderInThread} of {thread.posts.length}</span>
                        </div>
                      </div>
                      
                      <Link to={`/post/${post.slug}`}>
                        <Button variant="outline" size="sm">
                          Read Post
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Thread Navigation */}
        <div className="border-t pt-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-coffee mb-4">
              Continue Reading
            </h3>
            <p className="text-muted-foreground mb-6">
              This thread contains {thread.posts.length} posts. Start from the beginning or jump to any post.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {thread.posts.map((post, index) => (
                <Link key={post.id} to={`/post/${post.slug}`}>
                  <Button variant="outline" size="sm">
                    Part {post.orderInThread}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ThreadDetail;
