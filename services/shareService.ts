import { Share, Platform, Image } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface Quote {
  id: string;
  text: string;
  author: string;
  reflection?: string;
}

interface Video {
  id: string;
  title: string;
  youtubeId: string;
}

class ShareService {
  private appName = 'Spiritual Wisdom';
  private appStoreLink = 'https://apps.apple.com/app/spiritual-wisdom';
  private playStoreLink = 'https://play.google.com/store/apps/details?id=com.spiritualwisdom';
  private webAppLink = 'https://spiritualwisdom.app';

  // Array of spiritual guru images - using bundled local assets and Object Storage URLs
  private guruImages = {
    'quote-1': require('../assets/images/om-symbol.png'), // Placeholder for the first quote
    'quote-2': 'https://storage.googleapis.com/replit-objstore-74e3c4b0-bc72-4d55-9558-dc44b7baae09/guru-images/guru-image-2.jpg', // Corresponds to quote-2
    'quote-3': 'https://storage.googleapis.com/replit-objstore-74e3c4b0-bc72-4d55-9558-dc44b7baae09/guru-images/guru-image-3.jpg', // Corresponds to quote-3
    'quote-4': 'https://storage.googleapis.com/replit-objstore-74e3c4b0-bc72-4d55-9558-dc44b7baae09/guru-images/guru-image-4.jpg', // Corresponds to quote-4 (assuming quote-4 exists)
  };

  // Mapping of quote IDs to specific guru image keys
  private quoteImageMap: { [key: string]: string } = {
    'quote-1': 'quote-1', // First quote uses the first image
    'quote-2': 'quote-2', // Second quote uses the second image
    'quote-3': 'quote-3', // Third quote uses the third image
    'quote-4': 'quote-4', // Fourth quote uses the fourth image
  };

  async shareQuote(quote: Quote, includeImage = true): Promise<void> {
    try {
      if (includeImage) {
        await this.shareQuoteWithImage(quote);
      } else {
        await this.shareQuoteText(quote);
      }
    } catch (error) {
      console.error('Share quote error:', error);
      // Fallback to text sharing
      await this.shareQuoteText(quote);
    }
  }

  private async shareQuoteWithImage(quote: Quote): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await this.shareWebQuoteWithImage(quote);
      } else {
        await this.shareMobileQuoteWithImage(quote);
      }
    } catch (error) {
      console.error('Error sharing quote with image:', error);
      throw error;
    }
  }

  private getGuruImageForQuote(quoteId: string): any {
    const imageKey = this.quoteImageMap[quoteId];
    return imageKey ? this.guruImages[imageKey] : require('../assets/images/om-symbol.png'); // Default to om-symbol if no mapping
  }

  private async shareWebQuoteWithImage(quote: Quote): Promise<void> {
    // For web, we'll share just the text since local images are harder to handle
    const shareText = this.buildQuoteShareText(quote);

    if (navigator.share) {
      await navigator.share({
        title: 'Spiritual Wisdom Quote',
        text: shareText,
      });
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareText);
      alert('Quote text copied to clipboard!');
    }
  }

  private async shareMobileQuoteWithImage(quote: Quote): Promise<void> {
    try {
      // Get guru image for this specific quote
      const imageAsset = this.getGuruImageForQuote(quote.id);

      let imageUri: string;

      if (typeof imageAsset === 'string') {
        // It's a URL from Object Storage
        imageUri = imageAsset;
      } else {
        // It's a local asset, resolve it using Image.resolveAssetSource
        try {
          imageUri = Image.resolveAssetSource(imageAsset).uri;
        } catch (resolveError) {
          console.warn('Could not resolve asset source, falling back to text sharing:', resolveError);
          await this.shareQuoteText(quote);
          return;
        }
      }

      // Create the message text (reflection + app download)
      const messageText = this.buildQuoteShareText(quote);

      await Share.share({
        title: 'Spiritual Wisdom Quote',
        message: messageText,
        url: imageUri,
      });

    } catch (error) {
      console.error('Error sharing mobile quote with image:', error);
      // Fallback to text only
      await this.shareQuoteText(quote);
    }
  }

  private async shareQuoteText(quote: Quote): Promise<void> {
    const shareText = this.buildQuoteShareText(quote);

    await Share.share({
      title: 'Spiritual Wisdom Quote',
      message: shareText,
    });
  }

  private buildQuoteShareText(quote: Quote): string {
    let text = '';

    // Add reflection if available (this will appear under the image in messaging apps)
    if (quote.reflection) {
      text += `💭 ${quote.reflection}\n\n`;
    }

    // Add app download message 
    text += `🙏 Discover more spiritual wisdom and daily inspiration in the ${this.appName} app\n`;
    text += `📱 Download now: ${this.getDownloadLink()}`;

    return text;
  }

  private buildCompleteQuoteShareText(quote: Quote): string {
    let text = `"${quote.text}"\n— ${quote.author}\n\n`;

    // Add reflection if available
    if (quote.reflection) {
      text += `💭 ${quote.reflection}\n\n`;
    }

    // Add app download message 
    text += `🙏 Discover more spiritual wisdom and daily inspiration in the ${this.appName} app\n`;
    text += `📱 Download now: ${this.getDownloadLink()}`;

    return text;
  }

  async shareVideo(video: Video): Promise<void> {
    const youtubeUrl = `https://youtu.be/${video.youtubeId}`;
    const shareText = `🎥 "${video.title}"\n\n${youtubeUrl}\n\n🙏 Discover more spiritual videos in the ${this.appName} app\n📱 Download: ${this.getDownloadLink()}`;

    await Share.share({
      title: video.title,
      message: shareText,
    });
  }

  async shareApp(): Promise<void> {
    const shareText = `🙏 I found this beautiful spiritual app with daily wisdom, inspiring quotes, and sacred teachings. \n\nThought you might find it meaningful too!\n\n📱 Download ${this.appName}: ${this.getDownloadLink()}`;

    await Share.share({
      title: `Share ${this.appName}`,
      message: shareText,
    });
  }

  private getDownloadLink(): string {
    if (Platform.OS === 'ios') {
      return this.appStoreLink;
    } else if (Platform.OS === 'android') {
      return this.playStoreLink;
    } else {
      return this.webAppLink;
    }
  }
}

export const shareService = new ShareService();