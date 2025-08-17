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
  // Mock images for quotes - you can replace these with your actual spiritual quote images
  private mockQuoteImages = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&h=1080&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1080&h=1080&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=1080&h=1080&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1080&h=1080&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1080&h=1080&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1506765515384-028b60a970df?w=1080&h=1080&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1080&h=1080&fit=crop&auto=format&q=80',
    'https://images.unsplash.com/photo-1494256997604-768d1f608cac?w=1080&h=1080&fit=crop&auto=format&q=80'
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