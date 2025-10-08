import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

interface NewsletterSubscriptionProps {
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
  title?: string;
  description?: string;
}

export const NewsletterSubscription = ({ 
  variant = 'default',
  className = '',
  title = "Stay Updated",
  description = "Get notified when we publish new articles"
}: NewsletterSubscriptionProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
      const response = await apiClient.post('/newsletter/subscribe', { email });
      
      if (response.data.success) {
        setIsSubscribed(true);
        setEmail('');
        toast.success('Successfully subscribed to our newsletter!');
      }
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      
      if (error.response?.data?.error?.code === 'ALREADY_SUBSCRIBED') {
        toast.info('You are already subscribed to our newsletter');
        setIsSubscribed(true);
      } else {
        toast.error(error.response?.data?.error?.message || 'Failed to subscribe to newsletter');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email address to unsubscribe');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post('/newsletter/unsubscribe', { email });
      
      if (response.data.success) {
        setIsSubscribed(false);
        toast.success('Successfully unsubscribed from newsletter');
      }
    } catch (error: any) {
      console.error('Newsletter unsubscribe error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to unsubscribe from newsletter');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={className}
      >
        {variant === 'compact' ? (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-700 dark:text-green-300">
              You're subscribed to our newsletter!
            </span>
          </div>
        ) : variant === 'inline' ? (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Check className="h-4 w-4" />
            <span>Subscribed!</span>
          </div>
        ) : (
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Check className="h-12 w-12 text-green-600 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                You're Subscribed!
              </h3>
              <p className="text-green-700 dark:text-green-300 mb-4">
                Thank you for subscribing to our newsletter. You'll receive notifications when we publish new articles.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSubscribed(false)}
                className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-800/30"
              >
                Subscribe Another Email
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading} size="sm">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
        </Button>
      </form>
    );
  }

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className={`flex items-center gap-2 ${className}`}>
        <Input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-48"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading} size="sm">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Subscribe'
          )}
        </Button>
      </form>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Mail className="h-5 w-5 text-coffee" />
          {title}
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          {description}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full bg-coffee hover:bg-coffee/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subscribing...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Subscribe to Newsletter
              </>
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </CardContent>
    </Card>
  );
};
