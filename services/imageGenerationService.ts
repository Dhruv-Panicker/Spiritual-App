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
  // Spiritual guru images for quotes
  private mockQuoteImages = [
    require('../assets/images/guru-image-1.jpg'),
    require('../assets/images/guru-image-2.jpg'),
    require('../assets/images/guru-image-3.jpg'),
    require('../assets/images/guru-image-4.jpg')
  ];

  async generateQuoteImage(options: ShareImageOptions): Promise<string> {
    const { quote } = options;

    // Return mock image URL based on quote ID for consistency
    const imageIndex = parseInt(quote.id) % this.mockQuoteImages.length;
    return this.mockQuoteImages[imageIndex];
  }

  getMockImageForQuote(quoteId: string): any {
    const index = parseInt(quoteId) % this.mockQuoteImages.length;
    return this.mockQuoteImages[index];
  }
}

export const imageGenerationService = new ImageGenerationService();