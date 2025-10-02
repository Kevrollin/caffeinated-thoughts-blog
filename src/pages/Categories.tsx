import { motion } from 'framer-motion';
import { Coffee, Code, Palette, Lightbulb, Book } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

const categories = [
  {
    name: 'tutorials',
    title: 'Tutorials',
    description: 'Step-by-step guides and how-tos',
    icon: Code,
    color: 'text-blue-500',
  },
  {
    name: 'design',
    title: 'Design',
    description: 'UI/UX and creative inspiration',
    icon: Palette,
    color: 'text-purple-500',
  },
  {
    name: 'insights',
    title: 'Insights',
    description: 'Thoughts and observations',
    icon: Lightbulb,
    color: 'text-yellow-500',
  },
  {
    name: 'resources',
    title: 'Resources',
    description: 'Tools, libraries, and bookmarks',
    icon: Book,
    color: 'text-green-500',
  },
];

const Categories = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-cream to-amber/20 dark:from-charcoal dark:to-coffee/20 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex justify-center mb-6"
            >
              <Coffee className="h-16 w-16 text-coffee" />
            </motion.div>
            <h1 className="font-heading text-5xl font-bold mb-6 text-gradient-coffee">
              Categories
            </h1>
            <p className="text-xl text-muted-foreground">
              Explore content organized by topic
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/?category=${category.name}`}>
                  <Card className="hover-lift cursor-pointer h-full">
                    <CardContent className="p-8">
                      <div className={`mb-4 ${category.color}`}>
                        <Icon className="h-12 w-12" />
                      </div>
                      <h2 className="font-heading text-2xl font-bold mb-2 text-coffee">
                        {category.title}
                      </h2>
                      <p className="text-muted-foreground">
                        {category.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Categories;
