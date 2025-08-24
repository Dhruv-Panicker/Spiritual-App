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
  // Use Object Storage URLs for uploaded guru images
  private guruImages = [
    'https://storage.googleapis.com/replit-objstore-74e3c4b0-bc72-4d55-9558-dc44b7baae09/guru-images/guru-image-2.jpg',
    'https://storage.googleapis.com/replit-objstore-74e3c4b0-bc72-4d55-9558-dc44b7baae09/guru-images/guru-image-4.jpg',
    require('../assets/images/om-symbol.png'), // Fallback to local asset
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