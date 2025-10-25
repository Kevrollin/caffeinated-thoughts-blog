import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

const EditThread = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: threadData, isLoading } = useQuery({
    queryKey: ['thread', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/threads/${id}`);
      return data;
    },
    enabled: !!id
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');

  // Update form when thread data loads
  useState(() => {
    if (threadData?.thread) {
      setTitle(threadData.thread.title || '');
      setDescription(threadData.thread.description || '');
      setStatus(threadData.thread.status || 'DRAFT');
    }
  });

  const updateThreadMutation = useMutation({
    mutationFn: async (threadData: {
      title: string;
      description?: string;
      status: 'DRAFT' | 'PUBLISHED';
    }) => {
      const { data } = await apiClient.put(`/admin/threads/${id}`, threadData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      queryClient.invalidateQueries({ queryKey: ['thread', id] });
      toast.success('Thread updated successfully');
      navigate('/admin/threads');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update thread';
      toast.error(message);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    updateThreadMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      status
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="h-8 w-8 text-coffee" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/threads')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Threads
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-bold text-coffee">Edit Thread</h1>
          <p className="text-muted-foreground mt-2">
            Update thread details
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Thread Details</CardTitle>
            <CardDescription>
              Update the details for this thread
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter thread title..."
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter thread description (optional)..."
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
                  className="mt-2 w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/threads')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-coffee hover:bg-coffee/90"
                  disabled={updateThreadMutation.isPending}
                >
                  {updateThreadMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Thread
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default EditThread;
