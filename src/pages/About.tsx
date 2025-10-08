import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Github, Twitter, Linkedin, Mail, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BuyCoffeeModal } from '@/components/BuyCoffeeModal';

const About = () => {
  const [isCoffeeModalOpen, setIsCoffeeModalOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-cream to-amber/20 dark:from-charcoal dark:to-coffee/20 py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
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
              <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-coffee" />
            </motion.div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-gradient-coffee">
              About PatchNotes
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Where technology meets insights, and updates flow freely
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-12"
        >
          {/* Story */}
          <Card>
            <CardContent className="p-8">
              <h2 className="font-heading text-3xl font-bold mb-6 text-coffee">
                The Story
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <p>
                  Welcome to PatchNotes, a digital space where technology, 
                  insights, and development updates come together. This blog was born 
                  from the need to share the latest updates, insights, and 
                  a desire to share knowledge with the world.
                </p>
                <p>
                  Every post here is crafted with care, focusing on clarity and usefulness. 
                  Whether you're here to learn about the latest in web development, 
                  explore creative solutions to technical problems, or simply enjoy 
                  some thoughtful writing, you're in the right place.
                </p>
                <p>
                  This platform runs on modern web technologies and is powered by your 
                  support. Every virtual coffee you buy helps keep the lights on and 
                  the content flowing!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Mission */}
          <Card>
            <CardContent className="p-8">
              <h2 className="font-heading text-3xl font-bold mb-6 text-coffee">
                The Mission
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <ul className="space-y-3">
                  <li>Share practical knowledge and real-world solutions</li>
                  <li>Build a community of curious minds and continuous learners</li>
                  <li>Make complex topics accessible and enjoyable</li>
                  <li>Inspire others to create and innovate</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Connect */}
          <Card>
            <CardContent className="p-8">
              <h2 className="font-heading text-3xl font-bold mb-6 text-coffee">
                Let's Connect
              </h2>
              <p className="text-muted-foreground mb-6">
                Have questions, suggestions, or just want to say hi? I'd love to hear from you!
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" size="lg" asChild>
                  <a href="https://github.com/Kevrollin" target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="https://x.com/kevrollin012/" target="_blank" rel="noopener noreferrer">
                    <Twitter className="mr-2 h-4 w-4" />
                    Twitter
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="https://www.linkedin.com/in/kelvin-mukaria-831211359/?originalSubdomain=ke" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="mr-2 h-4 w-4" />
                    LinkedIn
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="kelvinmukaria2023@gmail.com">
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="border-2 border-emerald/30 bg-emerald/5">
            <CardContent className="p-8 text-center">
              <Coffee className="h-12 w-12 text-emerald mx-auto mb-4" />
              <h2 className="font-heading text-2xl font-bold mb-4">
                Support This Blog
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                If you find value in what you read here, consider buying me a coffee! 
                Your support helps keep this blog running and enables me to create more content.
              </p>
              <Button 
                size="lg" 
                className="bg-emerald hover:bg-emerald/90"
                onClick={() => setIsCoffeeModalOpen(true)}
              >
                <Coffee className="mr-2 h-5 w-5" />
                Do you like my Work?
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </section>
      </div>

      <BuyCoffeeModal
        isOpen={isCoffeeModalOpen}
        onClose={() => setIsCoffeeModalOpen(false)}
      />
    </>
  );
};

export default About;
