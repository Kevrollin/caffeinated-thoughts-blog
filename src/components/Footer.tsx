import { FileText, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NewsletterSubscription } from './NewsletterSubscription';

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/30 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-6 w-6 text-coffee" />
              <span className="text-lg font-heading font-bold text-coffee">
                PatchNotes
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Stay updated with the latest technology insights, development updates, 
              and tech discussions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-coffee transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-muted-foreground hover:text-coffee transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-coffee transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-heading font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com/Kevrollin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-coffee transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/kevrollin012/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-coffee transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/kelvin-mukaria-831211359/?originalSubdomain=ke"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-coffee transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-heading font-semibold mb-4">Newsletter</h3>
            <NewsletterSubscription variant="compact" />
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PatchNotes. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
