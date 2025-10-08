import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Check, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
      checkSubscriptionStatus(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const checkSubscriptionStatus = async (emailToCheck: string) => {
    setIsLoadingStatus(true);
    try {
      const response = await apiClient.get(`/newsletter/status?email=${encodeURIComponent(emailToCheck)}`);
      if (response.data.success && !response.data.isSubscribed) {
        setIsUnsubscribed(true);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post('/newsletter/unsubscribe', { email });
      
      if (response.data.success) {
        setIsUnsubscribed(true);
        toast.success('Successfully unsubscribed from newsletter');
      }
    } catch (error: any) {
      console.error('Newsletter unsubscribe error:', error);
      
      if (error.response?.data?.error?.code === 'NOT_FOUND') {
        toast.info('This email is not subscribed to our newsletter');
        setIsUnsubscribed(true);
      } else if (error.response?.data?.error?.code === 'ALREADY_UNSUBSCRIBED') {
        toast.info('This email is already unsubscribed');
        setIsUnsubscribed(true);
      } else {
        toast.error(error.response?.data?.error?.message || 'Failed to unsubscribe from newsletter');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking subscription status...</p>
        </div>
      </div>
    );
  }

  if (isUnsubscribed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream to-amber/20 dark:from-charcoal dark:to-coffee/20 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Check className="h-16 w-16 text-green-600 mx-auto mb-6" />
              </motion.div>
              <h1 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-4">
                Unsubscribed Successfully
              </h1>
              <p className="text-green-700 dark:text-green-300 mb-6">
                You have been unsubscribed from our newsletter. You will no longer receive email notifications about new articles.
              </p>
              <div className="space-y-3">
                <Link to="/">
                  <Button className="w-full bg-coffee hover:bg-coffee/90">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground">
                  You can resubscribe anytime by visiting our website.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-amber/20 dark:from-charcoal dark:to-coffee/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Mail className="h-5 w-5 text-coffee" />
              Unsubscribe from Newsletter
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              We're sorry to see you go. Enter your email to unsubscribe from our newsletter.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUnsubscribe} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading} 
                variant="destructive"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Unsubscribing...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Unsubscribe
                  </>
                )}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Unsubscribe;
