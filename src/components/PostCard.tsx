import { Link } from 'react-router-dom';
import { Calendar, Clock, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featuredImageUrl?: string | null;
    tags: string[];
    category: string;
    publishedAt: string;
  };
}

export const PostCard = ({ post }: PostCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateReadTime = (excerpt: string | null | undefined) => {
    if (!excerpt) return '1 min read';
    const wordsPerMinute = 200;
    const wordCount = excerpt.split(' ').length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/post/${post.slug}`}>
        <Card className="overflow-hidden h-full hover:shadow-coffee transition-all duration-300">
          {post.featuredImageUrl && (
            <div className="aspect-video overflow-hidden">
              <img
                src={post.featuredImageUrl}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          )}
          
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground mb-3">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{calculateReadTime(post.excerpt)}</span>
              </div>
            </div>

            <h3 className="font-heading text-lg sm:text-xl font-bold mb-2 line-clamp-2 text-coffee leading-tight">
              {post.title}
            </h3>
            
            {post.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {post.excerpt}
              </p>
            )}
          </CardContent>

          <CardFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
            <div className="flex items-center flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                {post.category}
              </Badge>
              {post.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
};
