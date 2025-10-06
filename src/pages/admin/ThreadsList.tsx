import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  FileText, 
  Calendar,
  User,
  MoreHorizontal,
  ArrowUpDown
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
    orderInThread: number;
    status: 'DRAFT' | 'PUBLISHED';
  }>;
  _count: {
    posts: number;
  };
  createdAt: string;
  updatedAt: string;
}

const ThreadsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: threadsData, isLoading } = useQuery({
    queryKey: ['threads'],
    queryFn: async () => {
      const { data } = await apiClient.get('/threads');
      return data;
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'DRAFT' | 'PUBLISHED' }) => {
      const { data } = await apiClient.put(`/admin/threads/${id}`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      toast.success('Thread status updated');
    },
    onError: () => {
      toast.error('Failed to update thread status');
    }
  });

  const deleteThreadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/threads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      toast.success('Thread deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete thread');
    }
  });

  const handleToggleStatus = (thread: Thread) => {
    const newStatus = thread.status === 'DRAFT' ? 'PUBLISHED' : 'DRAFT';
    toggleStatusMutation.mutate({ id: thread.id, status: newStatus });
  };

  const handleDelete = (thread: Thread) => {
    if (window.confirm(`Are you sure you want to delete "${thread.title}"? This will also delete all posts in this thread.`)) {
      deleteThreadMutation.mutate(thread.id);
    }
  };

  const filteredThreads = threadsData?.threads?.filter((thread: Thread) =>
    thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.description?.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-coffee">Threads</h1>
          <p className="text-muted-foreground mt-2">
            Manage your blog threads and continuous posts
          </p>
        </div>
        <Button
          onClick={() => navigate('/admin/threads/new')}
          className="bg-coffee hover:bg-coffee/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Thread
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search threads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
          />
        </div>
      </div>

      <div className="grid gap-6">
        {filteredThreads.map((thread: Thread) => (
          <motion.div
            key={thread.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-heading text-coffee">
                      {thread.title}
                    </CardTitle>
                    {thread.description && (
                      <CardDescription className="mt-2">
                        {thread.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={thread.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                      {thread.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/admin/threads/${thread.id}/edit`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(thread)}>
                          {thread.status === 'PUBLISHED' ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Publish
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(thread)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{thread.author.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>{thread._count.posts} posts</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/threads/${thread.id}/posts`)}
                    >
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Manage Posts
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/thread/${thread.slug}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredThreads.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No threads found
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first thread.'}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => navigate('/admin/threads/new')}
              className="bg-coffee hover:bg-coffee/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Thread
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ThreadsList;
