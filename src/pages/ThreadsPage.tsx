import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  FileText, 
  User, 
  Calendar,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

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
  _count: {
    posts: number;
  };
  createdAt: string;
  updatedAt: string;
}

const ThreadsPage = () => {
  const { data: threadsData, isLoading, error } = useQuery({
    queryKey: ['threads'],
    queryFn: async () => {
      const { data } = await apiClient.get('/threads');
      return data;
    }
  });

  // Filter only published threads for public view
  const publishedThreads = threadsData?.threads?.filter(
    (thread: Thread) => thread.status === 'PUBLISHED'
  ) || [];

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

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-heading font-bold text-coffee mb-4">
          Error Loading Threads
        </h1>
        <p className="text-muted-foreground">
          Failed to load threads. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <MessageSquare className="h-12 w-12 text-coffee" />
          </div>
          <h1 className="text-4xl font-heading font-bold text-coffee mb-4">
            Discussion Threads
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our multi-part discussion threads on various topics
          </p>
        </motion.div>

        {/* Threads List */}
        {publishedThreads.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No threads yet</h3>
            <p className="text-muted-foreground">
              Check back soon for new discussion threads!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {publishedThreads.map((thread: Thread, index: number) => (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link to={`/thread/${thread.slug}`}>
                  <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-coffee/50">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {thread._count.posts} {thread._count.posts === 1 ? 'post' : 'posts'}
                            </Badge>
                          </div>
                          <CardTitle className="text-2xl font-heading text-coffee mb-2">
                            {thread.title}
                          </CardTitle>
                          {thread.description && (
                            <CardDescription className="text-base">
                              {thread.description}
                            </CardDescription>
                          )}
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{thread.author.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreadsPage;
