import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Coffee, DollarSign, TrendingUp } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface Stats {
  posts: number;
  coffees: number;
  revenue: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({ posts: 0, coffees: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await apiClient.get('/admin/stats');
      setStats(data);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to load stats';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Posts',
      value: stats.posts,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Coffees Received',
      value: stats.coffees,
      icon: Coffee,
      color: 'text-emerald',
      bgColor: 'bg-emerald/10',
    },
    {
      title: 'Total Revenue',
      value: `KES ${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-amber',
      bgColor: 'bg-amber/10',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-coffee mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your blog.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average per post</span>
              <span className="font-medium">
                {stats.posts > 0
                  ? `KES ${Math.round(stats.revenue / stats.posts).toLocaleString()}`
                  : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average coffee value</span>
              <span className="font-medium">
                {stats.coffees > 0
                  ? `KES ${Math.round(stats.revenue / stats.coffees)}`
                  : 'N/A'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Welcome Message */}
      <Card className="border-2 border-emerald/30 bg-emerald/5">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-lg bg-emerald/20">
              <Coffee className="h-6 w-6 text-emerald" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold mb-2">
                Keep Creating Great Content!
              </h3>
              <p className="text-sm text-muted-foreground">
                Your readers are supporting you with {stats.coffees} coffees so far. 
                Keep sharing your caffeinated thoughts!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
