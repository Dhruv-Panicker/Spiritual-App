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
  // Use local guru images for quotes
  private guruImages = [
    require('../assets/images/guru-image-1.jpg'),
    require('../assets/images/guru-image-2.jpg'),
    require('../assets/images/guru-image-3.jpg'),
    require('../assets/images/guru-image-4.jpg'),
  ];

  async generateQuoteImage(options: ShareImageOptions): Promise<string> {
    const { quote } = options;

    // Return local image based on quote ID for consistency
    const imageIndex = parseInt(quote.id) % this.guruImages.length;
    const imageAsset = this.guruImages[imageIndex];

    // For React Native, return the require path
    return imageAsset;
  }

  getMockImageForQuote(quoteId: string) {
    const index = parseInt(quoteId) % this.guruImages.length;
    return this.guruImages[index];
  }
}

export const imageGenerationService = new ImageGenerationService();