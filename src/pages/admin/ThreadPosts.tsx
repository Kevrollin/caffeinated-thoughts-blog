import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowUp, 
  ArrowDown,
  FileText,
  Eye,
  EyeOff,
  GripVertical
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
import { toast } from 'sonner';

interface Thread {
  id: string;
  title: string;
  slug: string;
  description?: string;
  status: 'DRAFT' | 'PUBLISHED';
  posts: Array<{
    id: string;
    title: string;
    slug: string;
    orderInThread: number;
    status: 'DRAFT' | 'PUBLISHED';
  }>;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  threadId?: string;
  orderInThread?: number;
  createdAt: string;
}

const ThreadPosts = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [draggedPostId, setDraggedPostId] = useState<string | null>(null);

  const { data: threadData, isLoading: threadLoading } = useQuery({
    queryKey: ['thread', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/threads/${id}`);
      return data;
    },
    enabled: !!id
  });

  const { data: allPostsData, isLoading: postsLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/posts');
      return data;
    }
  });

  const addPostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await apiClient.post(`/admin/threads/${id}/posts`, { postId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread', id] });
      toast.success('Post added to thread');
    },
    onError: () => {
      toast.error('Failed to add post to thread');
    }
  });

  const removePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await apiClient.delete(`/admin/threads/${id}/posts`, { 
        data: { postId } 
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread', id] });
      toast.success('Post removed from thread');
    },
    onError: () => {
      toast.error('Failed to remove post from thread');
    }
  });

  const reorderPostsMutation = useMutation({
    mutationFn: async (postIds: string[]) => {
      const { data } = await apiClient.put(`/admin/threads/${id}/reorder`, { postIds });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread', id] });
      toast.success('Posts reordered');
    },
    onError: () => {
      toast.error('Failed to reorder posts');
    }
  });

  const handleAddPost = (postId: string) => {
    addPostMutation.mutate(postId);
  };

  const handleRemovePost = (postId: string) => {
    if (window.confirm('Are you sure you want to remove this post from the thread?')) {
      removePostMutation.mutate(postId);
    }
  };

  const handleMovePost = (postId: string, direction: 'up' | 'down') => {
    if (!threadData?.thread?.posts) return;

    const posts = [...threadData.thread.posts];
    const currentIndex = posts.findIndex(p => p.id === postId);
    
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= posts.length) return;
    
    // Swap posts
    [posts[currentIndex], posts[newIndex]] = [posts[newIndex], posts[currentIndex]];
    
    // Update orderInThread
    posts.forEach((post, index) => {
      post.orderInThread = index + 1;
    });
    
    reorderPostsMutation.mutate(posts.map(p => p.id));
  };

  const availablePosts = allPostsData?.posts?.filter((post: Post) => 
    !post.threadId || post.threadId !== id
  ) || [];

  const threadPosts = threadData?.thread?.posts || [];

  if (threadLoading || postsLoading) {
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/threads')}
            className="self-start"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Threads
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-coffee">
              {threadData?.thread?.title}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Manage posts in this thread
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate(`/admin/threads/${id}/posts/new`)}
          className="bg-coffee hover:bg-coffee/90 self-start lg:self-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Post to Thread
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Thread Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Thread Posts ({threadPosts.length})</CardTitle>
            <CardDescription>
              Posts currently in this thread
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {threadPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{post.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Order: {post.orderInThread}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={post.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                      {post.status}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMovePost(post.id, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMovePost(post.id, 'down')}
                        disabled={index === threadPosts.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/admin/posts/${post.id}/edit`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Post
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/post/${post.slug}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Post
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleRemovePost(post.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove from Thread
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
              {threadPosts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No posts in this thread yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Available Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Available Posts ({availablePosts.length})</CardTitle>
            <CardDescription>
              Posts that can be added to this thread
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availablePosts.map((post: Post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{post.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={post.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                      {post.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddPost(post.id)}
                      disabled={addPostMutation.isPending}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Thread
                    </Button>
                  </div>
                </motion.div>
              ))}
              {availablePosts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No available posts</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/admin/posts/new')}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Post
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThreadPosts;
