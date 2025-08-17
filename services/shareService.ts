
import { Share, Platform } from 'react-native';
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

  // Spiritual guru images for quote sharing (using local uploaded images)
  private quoteImages = [
    require('../assets/images/guru-image-1.jpg'),
    require('../assets/images/guru-image-2.jpg'),
    require('../assets/images/guru-image-3.jpg'),
    require('../assets/images/guru-image-4.jpg')
  ];

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
      // Get mock image for the quote
      const imageUrl = this.getMockImageForQuote(quote.id);
      
      if (Platform.OS === 'web') {
        await this.shareWebQuoteWithImage(quote, imageUrl);
      } else {
        await this.shareMobileQuoteWithImage(quote, imageUrl);
      }
    } catch (error) {
      console.error('Error sharing quote with image:', error);
      throw error;
    }
  }

  private getMockImageForQuote(quoteId: string): any {
    // Use quote ID to consistently pick the same image for the same quote
    const index = parseInt(quoteId) % this.quoteImages.length;
    return this.quoteImages[index];
  }

  private async shareWebQuoteWithImage(quote: Quote, localImage: any): Promise<void> {
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

  private async shareMobileQuoteWithImage(quote: Quote, localImage: any): Promise<void> {
    try {
      // For local images, we need to get the resolved asset URI
      const asset = localImage;
      
      // Create the message text (reflection + app download) - this will appear under the image
      const messageText = this.buildQuoteShareText(quote);

      // Use React Native Share with both URL and message for proper iMessage/WhatsApp display
      await Share.share({
        title: 'Spiritual Wisdom Quote',
        message: messageText,
        url: Platform.OS === 'ios' ? asset : undefined, // iOS handles URL better
        urls: Platform.OS === 'android' ? [asset] : undefined, // Android uses urls array
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
