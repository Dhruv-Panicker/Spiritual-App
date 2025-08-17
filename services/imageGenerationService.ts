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
  // Spiritual guru images for quotes (using spiritual/meditation themed URLs)
  private mockQuoteImages = [
    'https://images.unsplash.com/photo-1593104547216-9a631d0d4eff?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&h=600&fit=crop&crop=center'
  ];

  async generateQuoteImage(options: ShareImageOptions): Promise<string> {
    const { quote } = options;

    // Return mock image URL based on quote ID for consistency
    const imageIndex = parseInt(quote.id) % this.mockQuoteImages.length;
    return this.mockQuoteImages[imageIndex];
  }

  getMockImageForQuote(quoteId: string): string {
    const index = parseInt(quoteId) % this.mockQuoteImages.length;
    return this.mockQuoteImages[index];
  }
}

export const imageGenerationService = new ImageGenerationService();