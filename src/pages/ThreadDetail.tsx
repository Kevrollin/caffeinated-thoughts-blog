import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  Calendar, 
  User, 
  FileText, 
  ArrowLeft,
  Clock,
  Tag,
  ChevronDown,
  X,
  ChevronUp,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { apiClient } from '@/lib/api';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { markdownComponents } from '@/lib/markdown';
import 'highlight.js/styles/github-dark.css';

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
    contentMarkdown?: string;
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
  const queryClient = useQueryClient();
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  const { data: threadData, isLoading, error } = useQuery({
    queryKey: ['thread', slug],
    queryFn: async () => {
      const { data } = await apiClient.get(`/threads/${slug}`);
      return data;
    },
    enabled: !!slug
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await apiClient.delete(`/admin/threads/${threadData?.thread?.id}/posts`, {
        data: { postId }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread', slug] });
      toast.success('Post removed from thread');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to remove post from thread');
    }
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

  // Helper function to truncate content
  const truncateContent = (content: string, maxLength: number = 300) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
  };

  // Helper function to get plain text from markdown
  const getPlainText = (markdown: string) => {
    return markdown
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();
  };

  const handlePostClick = (postId: string) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  const handleCloseExpanded = () => {
    setExpandedPost(null);
  };

  const handleDeletePost = (postId: string, postTitle: string) => {
    if (window.confirm(`Are you sure you want to remove "${postTitle}" from this thread?`)) {
      deletePostMutation.mutate(postId);
    }
  };

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

        {/* Thread Posts - Expandable Style */}
        <div className="space-y-1">
          <h2 className="text-2xl font-heading font-bold text-coffee mb-6">
            Read Along
          </h2>
          
          <div className="space-y-0">
            {thread.posts.map((post, index) => {
              const isExpanded = expandedPost === post.id;
              const plainText = post.contentMarkdown ? getPlainText(post.contentMarkdown) : (post.excerpt || '');
              const truncatedText = truncateContent(plainText, 200);
              const shouldShowReadMore = plainText.length > 200;
              
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Connecting line (except last post) */}
                  {index < thread.posts.length - 1 && (
                    <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-border" />
                  )}
                  
                  <Card 
                    className={`hover:shadow-lg transition-all duration-300 cursor-pointer ${
                      isExpanded 
                        ? 'bg-accent/50 border-coffee shadow-lg' 
                        : 'hover:bg-accent/50 border-l-4 border-coffee/20 hover:border-coffee'
                    }`}
                    onClick={() => handlePostClick(post.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        {/* Thread number badge */}
                        <div className="flex-shrink-0">
                          <Badge className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-coffee text-white">
                            {post.orderInThread}
                          </Badge>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-2xl font-heading text-coffee">
                                {post.title}
                              </CardTitle>
                              {shouldShowReadMore && (
                                <motion.div
                                  animate={{ rotate: isExpanded ? 180 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                </motion.div>
                              )}
                            </div>
                            
                            {/* Delete Post Button */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePost(post.id, post.title);
                                  }}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove from Thread
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                            </div>
                            <span>•</span>
                            <span>Part {post.orderInThread} of {thread.posts.length}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pl-8 pr-2">
                      <AnimatePresence mode="wait">
                        {isExpanded ? (
                          <motion.div
                            key="expanded"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            {/*post.featuredImageUrl && (
                              <div className="mb-4">
                                <img
                                  src={post.featuredImageUrl}
                                  alt={post.title}
                                  className="w-full h-12 object-cover rounded-lg"
                                />
                              </div>
                            )*/}
                            
                            {post.contentMarkdown && (
                              <div className="prose prose-coffee dark:prose-invert max-w-none">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                                  components={markdownComponents}
                                >
                                  {post.contentMarkdown}
                                </ReactMarkdown>
                              </div>
                            )}
                          </motion.div>
                        ) : (
                          <motion.div
                            key="collapsed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-3"
                          >
                            {post.featuredImageUrl && (
                              <div className="mb-4">
                                <img
                                  src={post.featuredImageUrl}
                                  alt={post.title}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                              </div>
                            )}
                            
                            <div className="text-muted-foreground">
                              {truncatedText}
                              {shouldShowReadMore && (
                                <span className="text-coffee font-medium ml-1">
                                  ...read more
                                </span>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Floating Close Button */}
        <AnimatePresence>
          {expandedPost && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-8 right-8 z-50"
            >
              <Button
                onClick={handleCloseExpanded}
                size="lg"
                className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-coffee hover:bg-coffee/90"
              >
                <X className="h-5 w-5 mr-2" />
                Close Post
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ThreadDetail;
