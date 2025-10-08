import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Download, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string;
    full: string;
  };
  alt_description: string;
  user: {
    name: string;
    username: string;
  };
  links: {
    download_location: string;
  };
}

interface StockImagePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (imageUrl: string, altText: string) => void;
}

export const StockImagePicker = ({ isOpen, onClose, onImageSelect }: StockImagePickerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);
  const [customAltText, setCustomAltText] = useState('');

  // Popular categories for quick access
  const categories = [
    'technology', 'business', 'nature', 'people', 'architecture', 
    'food', 'travel', 'abstract', 'minimal', 'lifestyle'
  ];

  const searchImages = async (query: string = '') => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/unsplash/search?query=${encodeURIComponent(query)}&perPage=20`);
      
      if (response.data.success) {
        setImages(response.data.data.results || []);
      } else {
        setImages(getDemoImages());
        toast.warning('Failed to fetch images. Using demo images.');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      // Fallback to demo images
      setImages(getDemoImages());
      toast.warning('Network error. Using demo images.');
    } finally {
      setLoading(false);
    }
  };

  // Track image download (required by Unsplash API terms)
  const trackDownload = async (image: UnsplashImage) => {
    try {
      await apiClient.post('/unsplash/track-download', {
        downloadUrl: image.links.download_location
      });
    } catch (error) {
      console.error('Error tracking download:', error);
      // Don't show error to user, this is just for tracking
    }
  };

  // Demo images for when API is not available
  const getDemoImages = (): UnsplashImage[] => [
    {
      id: '1',
      urls: {
        small: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
        regular: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
        full: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200'
      },
      alt_description: 'Technology and coding',
      user: { name: 'Demo User', username: 'demo' },
      links: { download_location: '#' }
    },
    {
      id: '2',
      urls: {
        small: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400',
        regular: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800',
        full: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200'
      },
      alt_description: 'Business meeting',
      user: { name: 'Demo User', username: 'demo' },
      links: { download_location: '#' }
    },
    {
      id: '3',
      urls: {
        small: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
        regular: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
        full: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200'
      },
      alt_description: 'Nature landscape',
      user: { name: 'Demo User', username: 'demo' },
      links: { download_location: '#' }
    },
    {
      id: '4',
      urls: {
        small: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        regular: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        full: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200'
      },
      alt_description: 'Portrait photography',
      user: { name: 'Demo User', username: 'demo' },
      links: { download_location: '#' }
    },
    {
      id: '5',
      urls: {
        small: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400',
        regular: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
        full: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200'
      },
      alt_description: 'Modern architecture',
      user: { name: 'Demo User', username: 'demo' },
      links: { download_location: '#' }
    },
    {
      id: '6',
      urls: {
        small: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        regular: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800',
        full: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=1200'
      },
      alt_description: 'Delicious food',
      user: { name: 'Demo User', username: 'demo' },
      links: { download_location: '#' }
    }
  ];

  useEffect(() => {
    if (isOpen) {
      searchImages('technology'); // Load initial images
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchImages(searchTerm);
  };

  const handleCategoryClick = (category: string) => {
    setSearchTerm(category);
    searchImages(category);
  };

  const handleImageSelect = (image: UnsplashImage) => {
    setSelectedImage(image);
    setCustomAltText(image.alt_description || '');
  };

  const handleInsertImage = () => {
    if (selectedImage) {
      // Track download for Unsplash API compliance
      trackDownload(selectedImage);
      
      onImageSelect(selectedImage.urls.regular, customAltText);
      onClose();
      setSelectedImage(null);
      setCustomAltText('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Choose Stock Image
          </DialogTitle>
          <DialogDescription>
            Select an image from Unsplash to insert into your blog post
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search for images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </form>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {images.map((image) => (
              <div
                key={image.id}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage?.id === image.id ? 'border-primary' : 'border-transparent hover:border-muted-foreground'
                }`}
                onClick={() => handleImageSelect(image)}
              >
                <img
                  src={image.urls.small}
                  alt={image.alt_description}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
                {selectedImage?.id === image.id && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Download className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Selected Image Preview */}
          {selectedImage && (
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Selected Image</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedImage(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex gap-4">
                <img
                  src={selectedImage.urls.regular}
                  alt={selectedImage.alt_description}
                  className="w-32 h-24 object-cover rounded"
                />
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Alt text for accessibility"
                    value={customAltText}
                    onChange={(e) => setCustomAltText(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Photo by {selectedImage.user.name} on Unsplash
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleInsertImage} disabled={!selectedImage}>
              Insert Image
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
