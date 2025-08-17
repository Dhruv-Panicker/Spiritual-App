
import { Platform } from 'react-native';
import { SPIRITUAL_COLORS } from '../constants/SpiritualColors';

interface Quote {
  id: string;
  text: string;
  author: string;
  reflection?: string;
}

interface ShareImageOptions {
  quote: Quote;
  includeReflection?: boolean;
  theme?: 'light' | 'dark' | 'gradient';
}

class ImageGenerationService {
  // Spiritual guru images for quotes (using remote URLs)
  private mockQuoteImageUrls = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800&h=600&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108755-2616c727e48b?w=800&h=600&fit=crop&crop=face'
  ];

  async generateQuoteImage(options: ShareImageOptions): Promise<string> {
    const { quote } = options;

    // Return image URL based on quote ID for consistency
    const imageIndex = parseInt(quote.id) % this.mockQuoteImageUrls.length;
    return this.mockQuoteImageUrls[imageIndex];
  }

  getMockImageForQuote(quoteId: string): string {
    const index = parseInt(quoteId) % this.mockQuoteImageUrls.length;
    return this.mockQuoteImageUrls[index];
  }
}

export const imageGenerationService = new ImageGenerationService();
